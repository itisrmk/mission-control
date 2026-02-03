import { supabaseAdmin } from '@/lib/supabase'

interface GitHubRepo {
  owner: string
  repo: string
}

export async function fetchGitHubMetrics(projectId: string, accessToken: string, repoFullName: string) {
  const [owner, repo] = repoFullName.split('/')
  
  if (!owner || !repo) {
    throw new Error('Invalid repo format. Expected: owner/repo')
  }
  
  try {
    // Fetch commit count (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const since = thirtyDaysAgo.toISOString()
    
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )
    
    if (!commitsResponse.ok) {
      throw new Error(`GitHub API error: ${commitsResponse.status}`)
    }
    
    const commits = await commitsResponse.json()
    const commitCount = Array.isArray(commits) ? commits.length : 0
    
    // Fetch pull requests (open and closed in last 30 days)
    const prsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )
    
    const prs = await prsResponse.json()
    const prCount = Array.isArray(prs) ? prs.length : 0
    
    // Save metrics with UUID and timestamps
    const now = new Date().toISOString()
    await supabaseAdmin.from('Metric').insert({
      id: crypto.randomUUID(),
      projectId,
      type: 'GITHUB_COMMITS',
      value: commitCount,
      metadata: {
        period: '30d',
        repo: repoFullName,
      },
      recordedAt: now,
    } as any)
    
    await supabaseAdmin.from('Metric').insert({
      id: crypto.randomUUID(),
      projectId,
      type: 'GITHUB_PRS',
      value: prCount,
      metadata: {
        repo: repoFullName,
      },
      recordedAt: now,
    } as any)
    
    return { commits: commitCount, prs: prCount }
  } catch (error) {
    console.error('Error fetching GitHub metrics:', error)
    throw error
  }
}

// Fetch metrics for all projects with GitHub integration
export async function syncAllGitHubMetrics() {
  const { data: projects, error } = await supabaseAdmin
    .from('Project')
    .select('*')
    .not('githubRepo', 'is', null)
    .not('githubAccessToken', 'is', null)
  
  if (error) {
    console.error('Error fetching projects:', error)
    return
  }
  
  for (const project of projects || []) {
    if (project.githubRepo && project.githubAccessToken) {
      try {
        await fetchGitHubMetrics(
          project.id,
          project.githubAccessToken,
          project.githubRepo
        )
        console.log(`Synced GitHub metrics for ${project.name}`)
      } catch (error) {
        console.error(`Failed to sync ${project.name}:`, error)
      }
    }
  }
}
