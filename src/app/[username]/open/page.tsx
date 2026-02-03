import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, Code2, Twitter, Eye, Activity } from 'lucide-react'

interface Props {
  params: Promise<{
    username: string
  }>
}

export default async function PublicDashboard({ params }: Props) {
  const { username } = await params
  
  // Get user by username
  const { data: user, error: userError } = await supabaseAdmin
    .from('User')
    .select('*')
    .eq('username', username)
    .single()
  
  if (userError || !user) {
    notFound()
  }
  
  // Get public projects
  const { data: projects, error: projectsError } = await supabaseAdmin
    .from('Project')
    .select(`
      *,
      goals:Goal(*)
    `)
    .eq('userId', user.id)
    .eq('isPublic', true)
  
  if (projectsError || !projects || projects.length === 0) {
    notFound()
  }
  
  const project = projects[0] // Show first public project
  
  // Get latest metrics for each type
  const { data: metrics } = await supabaseAdmin
    .from('Metric')
    .select('*')
    .eq('projectId', project.id)
    .order('recordedAt', { ascending: false })
  
  // Get latest for each type
  const metricMap = new Map()
  metrics?.forEach((m) => {
    if (!metricMap.has(m.type)) {
      metricMap.set(m.type, m)
    }
  })
  
  return (
    <div className="min-h-screen bg-neutral-950 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <p className="text-neutral-400">Built in public by {user.name || user.email}</p>
          {project.domain && (
            <a 
              href={`https://${project.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 text-sm mt-2 inline-block"
            >
              {project.domain} →
            </a>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metricMap.get('MRR') && (
            <MetricCard
              title="Revenue"
              value={`$${metricMap.get('MRR')?.value.toLocaleString()} MRR`}
              icon={<TrendingUp className="h-4 w-4" />}
            />
          )}
          
          {metricMap.get('TOTAL_USERS') && (
            <MetricCard
              title="Users"
              value={metricMap.get('TOTAL_USERS')?.value.toLocaleString() || '0'}
              icon={<Users className="h-4 w-4" />}
            />
          )}
          
          {metricMap.get('GITHUB_COMMITS') && (
            <MetricCard
              title="Code Activity"
              value={`${metricMap.get('GITHUB_COMMITS')?.value} commits`}
              icon={<Code2 className="h-4 w-4" />}
            />
          )}
          
          {metricMap.get('TWITTER_FOLLOWERS') && (
            <MetricCard
              title="Social"
              value={`${metricMap.get('TWITTER_FOLLOWERS')?.value.toLocaleString()} followers`}
              icon={<Twitter className="h-4 w-4" />}
            />
          )}
          
          {metricMap.get('PAGE_VIEWS') && (
            <MetricCard
              title="Traffic"
              value={`${metricMap.get('PAGE_VIEWS')?.value.toLocaleString()} views`}
              icon={<Eye className="h-4 w-4" />}
            />
          )}
          
          {metricMap.get('UPTIME_PERCENTAGE') && (
            <MetricCard
              title="Uptime"
              value={`${metricMap.get('UPTIME_PERCENTAGE')?.value}%`}
              icon={<Activity className="h-4 w-4" />}
            />
          )}
        </div>
        
        {project.goals?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Goals</h2>
            <div className="space-y-4">
              {project.goals.map((goal: any) => (
                <div key={goal.id} className="bg-neutral-900 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>{goal.title}</span>
                    <span className="text-neutral-400">
                      {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 text-center text-sm text-neutral-500">
          <p>Powered by Mission Control</p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-400">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  )
}
