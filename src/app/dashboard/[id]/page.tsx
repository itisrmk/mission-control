import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import Dashboard from './dashboard-client'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectDashboard({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const { data: project, error } = await supabaseAdmin
    .from('Project')
    .select(`
      *,
      goals:Goal(*)
    `)
    .eq('id', id)
    .eq('userId', session.user.id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Get latest metrics for each type
  const metricTypes = [
    'MRR',
    'TOTAL_USERS',
    'GITHUB_COMMITS',
    'GITHUB_PRS',
    'TWITTER_FOLLOWERS',
    'TWITTER_IMPRESSIONS',
    'PAGE_VIEWS',
    'UPTIME_PERCENTAGE',
  ]

  const metrics: Record<string, any> = {}
  
  for (const type of metricTypes) {
    const { data: metric } = await supabaseAdmin
      .from('Metric')
      .select('*')
      .eq('projectId', id)
      .eq('type', type as any)
      .order('recordedAt', { ascending: false })
      .limit(1)
      .single()
    
    if (metric) {
      metrics[type] = metric
    }
  }

  // Get ship streak
  const { data: streakMetric } = await supabaseAdmin
    .from('Metric')
    .select('*')
    .eq('projectId', id)
    .eq('type', 'ACTIVE_USERS')
    .order('recordedAt', { ascending: false })
    .limit(1)
    .single()

  return (
    <Dashboard 
      project={project} 
      metrics={metrics} 
      goals={project.goals}
      streak={streakMetric?.value || 0}
    />
  )
}
