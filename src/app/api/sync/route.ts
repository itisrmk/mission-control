import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { fetchGitHubMetrics } from '@/lib/integrations/github'
import { fetchTwitterMetrics } from '@/lib/integrations/twitter'
import { fetchPlausibleMetrics } from '@/lib/integrations/plausible'
import { syncAllMetrics } from '@/lib/integrations/sync'

// POST /api/sync - Trigger manual sync for a project
export async function POST(request: Request) {
  const session = await auth()
  
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
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    })
    
    if (!project) {
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
      if (project.twitterHandle) {
        try {
          const bearerToken = process.env.TWITTER_BEARER_TOKEN
          if (bearerToken) {
            const twitter = await fetchTwitterMetrics(
              project.id,
              project.twitterHandle,
              bearerToken
            )
            results.twitter = twitter
          } else {
            results.twitter = { error: 'Twitter not configured' }
          }
        } catch (error) {
          results.twitter = { error: (error as Error).message }
        }
      }
    }
    
    if (!integration || integration === 'plausible') {
      if (project.plausibleSiteId) {
        try {
          const apiKey = process.env.PLAUSIBLE_API_KEY
          if (apiKey) {
            const plausible = await fetchPlausibleMetrics(
              project.id,
              project.plausibleSiteId,
              apiKey
            )
            results.plausible = plausible
          } else {
            results.plausible = { error: 'Plausible not configured' }
          }
        } catch (error) {
          results.plausible = { error: (error as Error).message }
        }
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
  const session = await auth()
  
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
    // Get last sync time for each integration
    const latestMetrics = await prisma.metric.findMany({
      where: { projectId },
      orderBy: { recordedAt: 'desc' },
      distinct: ['type'],
    })
    
    const syncStatus = latestMetrics.reduce((acc, metric) => {
      acc[metric.type] = {
        lastSync: metric.recordedAt,
        value: metric.value,
      }
      return acc
    }, {} as Record<string, any>)
    
    return NextResponse.json(syncStatus)
  } catch (error) {
    console.error('Error fetching sync status:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}
