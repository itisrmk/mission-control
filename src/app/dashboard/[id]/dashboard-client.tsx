'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Code2, 
  Twitter, 
  Eye, 
  Activity,
  Flame,
  Target,
  Settings,
  RefreshCw,
  ArrowLeft,
  Plus,
  AlertCircle
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

interface DashboardProps {
  project: {
    id: string
    name: string
    slug: string
    description: string | null
    isPublic: boolean
    domain: string | null
    githubRepo: string | null
    twitterHandle: string | null
    plausibleSiteId: string | null
    stripeAccountId: string | null
  }
  metrics: Record<string, any>
  goals: any[]
  streak: number
}

export default function Dashboard({ project, metrics, goals: initialGoals, streak }: DashboardProps) {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [goals, setGoals] = useState(initialGoals)
  const [creatingGoal, setCreatingGoal] = useState(false)
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    target: '',
    unit: '',
    current: '0'
  })

  async function handleSync() {
    setSyncing(true)
    setError(null)
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Sync failed')
      }
      
      // Check for integration errors
      const errors: string[] = []
      if (data.results?.github?.error) errors.push(`GitHub: ${data.results.github.error}`)
      if (data.results?.twitter?.error) errors.push(`Twitter: ${data.results.twitter.error}`)
      if (data.results?.plausible?.error) errors.push(`Plausible: ${data.results.plausible.error}`)
      
      if (errors.length > 0) {
        setError(errors.join('\n'))
        setSyncing(false)
        return
      }
      
      // Reload to show new data
      window.location.reload()
    } catch (err: any) {
      console.error('Sync failed:', err)
      setError(err.message || 'Failed to sync. Please check your integration settings.')
      setSyncing(false)
    }
  }

  async function createGoal(e: React.FormEvent) {
    e.preventDefault()
    setCreatingGoal(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          title: goalForm.title,
          description: goalForm.description,
          target: parseInt(goalForm.target) || 0,
          unit: goalForm.unit,
          current: parseInt(goalForm.current) || 0,
        }),
      })
      if (!res.ok) throw new Error('Failed to create goal')
      const newGoal = await res.json()
      setGoals([...goals, newGoal])
      setShowGoalDialog(false)
      setGoalForm({ title: '', description: '', target: '', unit: '', current: '0' })
    } catch (err) {
      alert('Failed to create goal')
    } finally {
      setCreatingGoal(false)
    }
  }

  // Build chart data from actual metrics - NO FAKE DATA
  const revenueHistory = metrics.MRR ? [
    { name: 'Current', value: metrics.MRR.value }
  ] : []
  
  const trafficHistory = metrics.PAGE_VIEWS ? [
    { name: 'Current', views: metrics.PAGE_VIEWS.value }
  ] : []

  // Check if we have any real data
  const hasRevenueData = !!metrics.MRR?.value
  const hasTrafficData = !!metrics.PAGE_VIEWS?.value
  const hasAnyMetrics = Object.keys(metrics).length > 0

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Create Goal Dialog */}
        <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Set a target to track for your project
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createGoal} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input
                  placeholder="e.g., Reach 1000 Users"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                  className="bg-neutral-800 border-neutral-700"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Value</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={goalForm.target}
                    onChange={(e) => setGoalForm({...goalForm, target: e.target.value})}
                    className="bg-neutral-800 border-neutral-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    placeholder="users, $, etc"
                    value={goalForm.unit}
                    onChange={(e) => setGoalForm({...goalForm, unit: e.target.value})}
                    className="bg-neutral-800 border-neutral-700"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current Progress (optional)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={goalForm.current}
                  onChange={(e) => setGoalForm({...goalForm, current: e.target.value})}
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGoalDialog(false)}
                  className="border-neutral-700 text-white hover:text-white hover:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingGoal}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {creatingGoal ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="border-neutral-700 text-white hover:text-white hover:bg-neutral-800">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                {project.isPublic && (
                  <Badge className="bg-green-500/10 text-green-500">Public</Badge>
                )}
              </div>
              {project.description && (
                <p className="text-neutral-400 mt-1">{project.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
              className="border-neutral-700 text-white hover:text-white hover:bg-neutral-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync'}
            </Button>
            
            <Link href={`/dashboard/${project.id}/settings`}>
              <Button variant="outline" className="border-neutral-700 text-white hover:text-white hover:bg-neutral-800">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Ship Streak */}
        {streak > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 via-red-500/10 to-purple-500/10 border border-orange-500/20">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(streak, 14) }).map((_, i) => (
                  <Flame key={i} className="h-6 w-6 text-orange-500 fill-orange-500" />
                ))}
              </div>
              <div>
                <h2 className="text-lg font-semibold">Ship Streak: {streak} Days 🔥</h2>
                <p className="text-neutral-400 text-sm">Keep shipping to maintain your streak!</p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid - NO FAKE DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue - Show empty state if no Stripe connected */}
          <MetricCard
            title="Revenue"
            value={hasRevenueData ? `$${metrics.MRR.value.toLocaleString()} MRR` : '--'}
            subtitle={!project.stripeAccountId ? 'Connect Stripe' : !hasRevenueData ? 'No data yet' : undefined}
            change={metrics.MRR?.metadata?.growthRate ? `+${metrics.MRR.metadata.growthRate}%` : undefined}
            changeType="positive"
            icon={<TrendingUp className="h-4 w-4" />}
            connected={!!project.stripeAccountId}
            hasData={hasRevenueData}
          />
          
          {/* Users */}
          <MetricCard
            title="Users"
            value={metrics.TOTAL_USERS?.value?.toLocaleString() || '--'}
            subtitle={!metrics.TOTAL_USERS ? 'No data yet' : undefined}
            change={metrics.TOTAL_USERS ? 'Total' : undefined}
            changeType="neutral"
            icon={<Users className="h-4 w-4" />}
            hasData={!!metrics.TOTAL_USERS}
          />
          
          {/* Code Activity */}
          <MetricCard
            title="Code Activity"
            value={metrics.GITHUB_COMMITS?.value !== undefined ? `${metrics.GITHUB_COMMITS.value} commits` : '--'}
            subtitle={!project.githubRepo ? 'Connect GitHub' : !metrics.GITHUB_COMMITS ? 'No data yet' : undefined}
            change={metrics.GITHUB_PRS?.value ? `${metrics.GITHUB_PRS.value} PRs` : undefined}
            changeType="positive"
            icon={<Code2 className="h-4 w-4" />}
            connected={!!project.githubRepo}
            hasData={!!metrics.GITHUB_COMMITS}
          />
          
          {/* Social */}
          <MetricCard
            title="Social"
            value={metrics.TWITTER_FOLLOWERS?.value !== undefined ? `${metrics.TWITTER_FOLLOWERS.value.toLocaleString()} followers` : '--'}
            subtitle={!project.twitterHandle ? 'Connect Twitter' : !metrics.TWITTER_FOLLOWERS ? 'No data yet' : undefined}
            change={metrics.TWITTER_IMPRESSIONS?.value ? `${metrics.TWITTER_IMPRESSIONS.value} tweets` : undefined}
            changeType="positive"
            icon={<Twitter className="h-4 w-4" />}
            connected={!!project.twitterHandle}
            hasData={!!metrics.TWITTER_FOLLOWERS}
          />
          
          {/* Traffic */}
          <MetricCard
            title="Traffic"
            value={metrics.PAGE_VIEWS?.value !== undefined ? `${metrics.PAGE_VIEWS.value.toLocaleString()} views` : '--'}
            subtitle={!project.plausibleSiteId ? 'Connect Plausible' : !metrics.PAGE_VIEWS ? 'No data yet' : undefined}
            change={metrics.PAGE_VIEWS ? 'Last 7 days' : undefined}
            changeType="positive"
            icon={<Eye className="h-4 w-4" />}
            connected={!!project.plausibleSiteId}
            hasData={!!metrics.PAGE_VIEWS}
          />
          
          {/* Uptime */}
          <MetricCard
            title="Uptime"
            value={metrics.UPTIME_PERCENTAGE?.value !== undefined ? `${metrics.UPTIME_PERCENTAGE.value}%` : '--'}
            subtitle={!metrics.UPTIME_PERCENTAGE ? 'No data yet' : undefined}
            change={metrics.UPTIME_PERCENTAGE ? 'Last 30 days' : undefined}
            changeType="positive"
            icon={<Activity className="h-4 w-4" />}
            hasData={!!metrics.UPTIME_PERCENTAGE}
          />
        </div>

        {/* Empty State - No metrics at all */}
        {!hasAnyMetrics && (
          <div className="mb-8 p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
            <div className="h-16 w-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-neutral-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No metrics yet</h3>
            <p className="text-neutral-400 mb-4 max-w-md mx-auto">
              Connect your integrations in settings to start tracking metrics. 
              We support Stripe, GitHub, Twitter, and Plausible Analytics.
            </p>
            <Link href={`/dashboard/${project.id}/settings`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Connect Integrations
              </Button>
            </Link>
          </div>
        )}

        {/* Charts - Only show if we have data */}
        {(hasRevenueData || hasTrafficData) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            {hasRevenueData && revenueHistory.length > 1 ? (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription className="text-neutral-400">Monthly recurring revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={revenueHistory}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="name" stroke="#525252" fontSize={12} />
                      <YAxis stroke="#525252" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626' }}
                        labelStyle={{ color: '#a3a3a3' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : hasRevenueData ? (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription className="text-neutral-400">Monthly recurring revenue over time</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[200px]">
                  <p className="text-neutral-500">Need more data points to show chart</p>
                </CardContent>
              </Card>
            ) : null}

            {/* Traffic Chart */}
            {hasTrafficData && trafficHistory.length > 1 ? (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Traffic Overview</CardTitle>
                  <CardDescription className="text-neutral-400">Page views over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trafficHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="name" stroke="#525252" fontSize={12} />
                      <YAxis stroke="#525252" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626' }}
                        labelStyle={{ color: '#a3a3a3' }}
                      />
                      <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : hasTrafficData ? (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Traffic Overview</CardTitle>
                  <CardDescription className="text-neutral-400">Page views over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[200px]">
                  <p className="text-neutral-500">Need more data points to show chart</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}

        {/* Goals */}
        <div className="mb-8">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-500" />
                <CardTitle>Goals</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowGoalDialog(true)}
                className="border-neutral-700 text-white hover:text-white hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-500 mb-4">No goals yet. Create your first goal to track progress!</p>
                  <Button 
                    variant="outline"
                    onClick={() => setShowGoalDialog(true)}
                    className="border-neutral-700 text-white hover:text-white hover:bg-neutral-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Goal
                  </Button>
                </div>
              ) : (
                goals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-300">{goal.title}</span>
                      <span className="text-neutral-400">
                        {goal.current?.toLocaleString() || 0} / {goal.target?.toLocaleString() || 0} {goal.unit}
                        {' '}
                        ({Math.round(((goal.current || 0) / (goal.target || 1)) * 100)}%)
                      </span>
                    </div>
                    <Progress 
                      value={((goal.current || 0) / (goal.target || 1)) * 100} 
                      className="h-2 bg-neutral-800" 
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Integrations */}
        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-3">Connected Integrations</p>
          <div className="flex justify-center space-x-4">
            {[
              { name: 'Stripe', connected: !!project.stripeAccountId },
              { name: 'GitHub', connected: !!project.githubRepo },
              { name: 'Twitter', connected: !!project.twitterHandle },
              { name: 'Plausible', connected: !!project.plausibleSiteId },
            ].map((integration) => (
              <Badge 
                key={integration.name}
                variant="secondary" 
                className={`${integration.connected ? 'bg-green-500/10 text-green-500' : 'bg-neutral-800 text-neutral-500'} border-neutral-700`}
              >
                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${integration.connected ? 'bg-green-500' : 'bg-neutral-600'}`} />
                {integration.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  change?: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  connected?: boolean
  hasData?: boolean
}

function MetricCard({ title, value, subtitle, change, changeType, icon, connected, hasData }: MetricCardProps) {
  const changeColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-neutral-500',
  }

  const ChangeIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : Activity

  return (
    <Card className={`bg-neutral-900 border-neutral-800 ${!hasData && connected === false ? 'opacity-75' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-400">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {connected !== undefined && (
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-neutral-600'}`} />
          )}
          <div className="h-8 w-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${hasData ? 'text-white' : 'text-neutral-500'}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
        )}
        {change && hasData && (
          <div className="flex items-center text-xs mt-1">
            <ChangeIcon className={`h-3 w-3 mr-1 ${changeColors[changeType]}`} />
            <span className={changeColors[changeType]}>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
