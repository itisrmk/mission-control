import { supabaseAdmin } from '@/lib/supabase'

interface PlausibleSite {
  domain: string
  id: string
}

export async function fetchPlausibleMetrics(
  projectId: string, 
  siteId: string, 
  apiKey: string
) {
  const plausibleUrl = process.env.PLAUSIBLE_URL || 'https://plausible.io'
  
  try {
    // Get pageviews for last 7 days
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const response = await fetch(
      `${plausibleUrl}/api/v1/stats/aggregate?` +
      `site_id=${siteId}` +
      `&period=7d` +
      `&metrics=visitors,pageviews`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    )
    
    if (!response.ok) {
      throw new Error(`Plausible API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Save page views metric
    await supabaseAdmin.from('Metric').insert({
      projectId,
      type: 'PAGE_VIEWS',
      value: data.results?.pageviews?.value || 0,
      metadata: {
        siteId,
        period: '7d',
        visitors: data.results?.visitors?.value || 0,
      },
    })
    
    // Fetch top sources
    const sourcesResponse = await fetch(
      `${plausibleUrl}/api/v1/stats/breakdown?` +
      `site_id=${siteId}` +
      `&period=7d` +
      `&property=visit:source` +
      `&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    )
    
    const sourcesData = await sourcesResponse.json()
    
    return {
      pageviews: data.results?.pageviews?.value || 0,
      visitors: data.results?.visitors?.value || 0,
      topSources: sourcesData.results || [],
    }
  } catch (error) {
    console.error('Error fetching Plausible metrics:', error)
    throw error
  }
}

// Fetch metrics for all projects with Plausible integration
export async function syncAllPlausibleMetrics() {
  const { data: projects, error } = await supabaseAdmin
    .from('Project')
    .select('*')
    .not('plausibleSiteId', 'is', null)
  
  if (error) {
    console.error('Error fetching projects:', error)
    return
  }
  
  const apiKey = process.env.PLAUSIBLE_API_KEY
  
  if (!apiKey) {
    console.error('PLAUSIBLE_API_KEY not configured')
    return
  }
  
  for (const project of projects || []) {
    if (project.plausibleSiteId) {
      try {
        await fetchPlausibleMetrics(
          project.id,
          project.plausibleSiteId,
          apiKey
        )
        console.log(`Synced Plausible metrics for ${project.name}`)
      } catch (error) {
        console.error(`Failed to sync Plausible for ${project.name}:`, error)
      }
    }
  }
}
