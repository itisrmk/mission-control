import { syncAllGitHubMetrics } from './github'
import { syncAllTwitterMetrics } from './twitter'
import { syncAllPlausibleMetrics } from './plausible'
import { supabaseAdmin } from '../supabase'

// Main sync function - call this periodically (e.g., every hour)
export async function syncAllMetrics() {
  console.log('Starting metrics sync...', new Date().toISOString())
  
  try {
    // Sync GitHub metrics
    await syncAllGitHubMetrics()
    
    // Sync Twitter metrics
    await syncAllTwitterMetrics()
    
    // Sync Plausible metrics
    await syncAllPlausibleMetrics()
    
    // Update calculated metrics (e.g., MRR growth, churn rate)
    await updateCalculatedMetrics()
    
    console.log('Metrics sync completed successfully')
  } catch (error) {
    console.error('Error during metrics sync:', error)
  }
}

// Update calculated metrics that depend on historical data
async function updateCalculatedMetrics() {
  const { data: projects, error } = await supabaseAdmin.from('Project').select('id')
  
  if (error) {
    console.error('Error fetching projects:', error)
    return
  }
  
  for (const project of projects || []) {
    // Calculate MRR growth rate
    const { data: mrrMetrics } = await supabaseAdmin
      .from('Metric')
      .select('*')
      .eq('projectId', project.id)
      .eq('type', 'MRR')
      .order('recordedAt', { ascending: false })
      .limit(2)
    
    if (mrrMetrics && mrrMetrics.length === 2) {
      const current = mrrMetrics[0].value
      const previous = mrrMetrics[1].value
      const growthRate = ((current - previous) / previous) * 100
      
      // Store growth rate as metadata on the latest metric
      await supabaseAdmin
        .from('Metric')
        .update({
          metadata: {
            ...(mrrMetrics[0].metadata as object || {}),
            growthRate: growthRate.toFixed(2),
            previousValue: previous,
          },
        })
        .eq('id', mrrMetrics[0].id)
    }
  }
}

// Update ship streak for all projects
export async function updateShipStreaks() {
  const { data: projects, error } = await supabaseAdmin
    .from('Project')
    .select(`
      *,
      metrics:Metric(*)
    `)
    .eq('metrics.type', 'GITHUB_COMMITS')
    .order('metrics.recordedAt', { ascending: false })
    .limit(30)
  
  if (error) {
    console.error('Error fetching projects:', error)
    return
  }
  
  for (const project of projects || []) {
    const recentCommits = project.metrics || []
    
    // Calculate streak: consecutive days with commits
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      
      const hasCommit = recentCommits.some((m: any) => {
        const metricDate = new Date(m.recordedAt)
        metricDate.setHours(0, 0, 0, 0)
        return metricDate.getTime() === checkDate.getTime() && m.value > 0
      })
      
      if (hasCommit) {
        streak++
      } else if (i > 0) {
        // Break on first day without commits (except today)
        break
      }
    }
    
    // Store streak as a metric
    await supabaseAdmin.from('Metric').insert({
      projectId: project.id,
      type: 'ACTIVE_USERS', // Using as streak storage for now
      value: streak,
      metadata: { metricType: 'shipStreak' },
    } as any)
    
    console.log(`${project.name}: ${streak} day streak`)
  }
}

// Run if called directly
if (require.main === module) {
  syncAllMetrics()
    .then(() => updateShipStreaks())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
