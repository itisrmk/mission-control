import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { fetchGitHubMetrics } from '@/lib/integrations/github'
import { fetchTwitterMetrics } from '@/lib/integrations/twitter'
import { fetchPlausibleMetrics } from '@/lib/integrations/plausible'

// POST /api/sync - Trigger manual sync for a project
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { projectId, integration } = body
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }
    
    // Verify ownership
    const { data: project, error: projectError } = await supabaseAdmin
      .from('Project')
      .select('*')
      .eq('id', projectId)
      .eq('userId', session.user.id)
      .single()
    
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    const results: Record<string, any> = {}
    
    // Sync specific integration or all
    if (!integration || integration === 'github') {
      if (project.githubRepo && project.githubAccessToken) {
        try {
          const github = await fetchGitHubMetrics(
            project.id,
            project.githubAccessToken,
            project.githubRepo
          )
          results.github = github
        } catch (error) {
          results.github = { error: (error as Error).message }
        }
      }
    }
    
    if (!integration || integration === 'twitter') {
      if (project.twitterHandle && project.twitterAccessToken) {
        try {
          const twitter = await fetchTwitterMetrics(
            project.id,
            project.twitterHandle,
            project.twitterAccessToken
          )
          results.twitter = twitter
        } catch (error) {
          results.twitter = { error: (error as Error).message }
        }
      } else if (project.twitterHandle && !project.twitterAccessToken) {
        results.twitter = { error: 'Twitter Bearer Token required. Add it in Settings.' }
      }
    }
    
    if (!integration || integration === 'plausible') {
      if (project.plausibleSiteId && project.plausibleApiKey) {
        try {
          const plausible = await fetchPlausibleMetrics(
            project.id,
            project.plausibleSiteId,
            project.plausibleApiKey
          )
          results.plausible = plausible
        } catch (error) {
          results.plausible = { error: (error as Error).message }
        }
      } else if (project.plausibleSiteId && !project.plausibleApiKey) {
        results.plausible = { error: 'Plausible API Key required. Add it in Settings.' }
      }
    }
    
    return NextResponse.json({
      success: true,
      projectId,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error syncing:', error)
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 })
  }
}

// GET /api/sync - Get sync status
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    )
  }
  
  try {
    // Get all metrics for project
    const { data: metrics, error } = await supabaseAdmin
      .from('Metric')
      .select('*')
      .eq('projectId', projectId)
      .order('recordedAt', { ascending: false })
    
    if (error) throw error
    
    // Get latest for each type
    const latestByType = new Map()
    metrics?.forEach((metric) => {
      if (!latestByType.has(metric.type)) {
        latestByType.set(metric.type, metric)
      }
    })
    
    const syncStatus: Record<string, any> = {}
    latestByType.forEach((metric, type) => {
      syncStatus[type] = {
        lastSync: metric.recordedAt,
        value: metric.value,
      }
    })
    
    return NextResponse.json(syncStatus)
  } catch (error) {
    console.error('Error fetching sync status:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}
