import { supabaseAdmin } from '@/lib/supabase'

interface TwitterMetrics {
  followers: number
  following: number
  tweets: number
  impressions?: number
}

export async function fetchTwitterMetrics(projectId: string, handle: string, bearerToken: string) {
  try {
    // Fetch user info by username
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${handle.replace('@', '')}?user.fields=public_metrics`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    )
    
    if (!userResponse.ok) {
      const error = await userResponse.text()
      console.error('Twitter API error:', error)
      throw new Error(`Twitter API error: ${userResponse.status}`)
    }
    
    const userData = await userResponse.json()
    const metrics = userData.data?.public_metrics
    
    if (!metrics) {
      throw new Error('No metrics found for user')
    }
    
    // Save followers metric with UUID and timestamps
    const now = new Date().toISOString()
    await supabaseAdmin.from('Metric').insert({
      id: crypto.randomUUID(),
      projectId,
      type: 'TWITTER_FOLLOWERS',
      value: metrics.followers_count || 0,
      metadata: {
        handle,
        following_count: metrics.following_count,
        tweet_count: metrics.tweet_count,
      },
      recordedAt: now,
    } as any)
    
    // Save tweet count as engagement metric
    await supabaseAdmin.from('Metric').insert({
      id: crypto.randomUUID(),
      projectId,
      type: 'TWITTER_IMPRESSIONS',
      value: metrics.tweet_count || 0,
      metadata: {
        handle,
        listed_count: metrics.listed_count,
      },
      recordedAt: now,
    } as any)
    
    return {
      followers: metrics.followers_count,
      following: metrics.following_count,
      tweets: metrics.tweet_count,
    }
  } catch (error) {
    console.error('Error fetching Twitter metrics:', error)
    throw error
  }
}

// Fetch metrics for all projects with Twitter integration
export async function syncAllTwitterMetrics() {
  const { data: projects, error } = await supabaseAdmin
    .from('Project')
    .select('*')
    .not('twitterHandle', 'is', null)
  
  if (error) {
    console.error('Error fetching projects:', error)
    return
  }
  
  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  
  if (!bearerToken) {
    console.error('TWITTER_BEARER_TOKEN not configured')
    return
  }
  
  for (const project of projects || []) {
    if (project.twitterHandle) {
      try {
        await fetchTwitterMetrics(
          project.id,
          project.twitterHandle,
          bearerToken
        )
        console.log(`Synced Twitter metrics for ${project.name}`)
      } catch (error) {
        console.error(`Failed to sync Twitter for ${project.name}:`, error)
      }
    }
  }
}

// Post a tweet (for "Ship Streak" celebrations)
export async function postShipStreakTweet(handle: string, streakDays: number, projectName: string) {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessSecret = process.env.TWITTER_ACCESS_SECRET
  
  if (!bearerToken || !apiKey || !accessToken) {
    console.error('Twitter credentials not configured')
    return
  }
  
  const messages = [
    `🔥 ${streakDays} day shipping streak for ${projectName}! Building in public hits different.`,
    `Just shipped for ${streakDays} days straight! ${projectName} is alive and growing 🚀`,
    `${streakDays} days of consistent shipping. The compound effect is real. #buildinpublic`,
  ]
  
  const message = messages[Math.floor(Math.random() * messages.length)]
  
  try {
    // Note: This requires OAuth 1.0a which is more complex
    // For now, just log the intention
    console.log(`Would tweet: ${message}`)
    
    // TODO: Implement OAuth 1.0a signing for posting tweets
    return { success: true, message }
  } catch (error) {
    console.error('Error posting tweet:', error)
    throw error
  }
}
