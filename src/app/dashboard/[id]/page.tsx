import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Dashboard from './dashboard-client'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectDashboard({ params }: Props) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      goals: true,
    },
  })

  if (!project) {
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
    const metric = await prisma.metric.findFirst({
      where: {
        projectId: id,
        type,
      },
      orderBy: { recordedAt: 'desc' },
    })
    if (metric) {
      metrics[type] = metric
    }
  }

  // Get ship streak
  const streakMetric = await prisma.metric.findFirst({
    where: {
      projectId: id,
      type: 'ACTIVE_USERS',
    },
    orderBy: { recordedAt: 'desc' },
  })

  return (
    <Dashboard 
      project={project} 
      metrics={metrics} 
      goals={project.goals}
      streak={streakMetric?.value || 0}
    />
  )
}
