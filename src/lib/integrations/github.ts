import { prisma } from '@/lib/prisma'

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
    
    // Save metrics
    await prisma.metric.create({
      data: {
        projectId,
        type: 'GITHUB_COMMITS',
        value: commitCount,
        metadata: {
          period: '30d',
          repo: repoFullName,
        },
      },
    })
    
    await prisma.metric.create({
      data: {
        projectId,
        type: 'GITHUB_PRS',
        value: prCount,
        metadata: {
          repo: repoFullName,
        },
      },
    })
    
    return { commits: commitCount, prs: prCount }
  } catch (error) {
    console.error('Error fetching GitHub metrics:', error)
    throw error
  }
}

// Fetch metrics for all projects with GitHub integration
export async function syncAllGitHubMetrics() {
  const projects = await prisma.project.findMany({
    where: {
      githubRepo: { not: null },
      githubAccessToken: { not: null },
    },
  })
  
  for (const project of projects) {
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
