import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/metrics?projectId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  
  if (!projectId) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
  }
  
  try {
    // Get all metrics for project
    const { data: allMetrics, error: metricsError } = await supabaseAdmin
      .from('Metric')
      .select('*')
      .eq('projectId', projectId)
    
    if (metricsError) throw metricsError
    
    // Get latest metric for each type
    const latestByType = new Map()
    allMetrics?.forEach((metric) => {
      const existing = latestByType.get(metric.type)
      if (!existing || new Date(metric.recordedAt) > new Date(existing.recordedAt)) {
        latestByType.set(metric.type, metric)
      }
    })
    
    // Get goals
    const { data: goals, error: goalsError } = await supabaseAdmin
      .from('Goal')
      .select('*')
      .eq('projectId', projectId)
      .order('createdAt', { ascending: false })
    
    if (goalsError) throw goalsError
    
    return NextResponse.json({
      metrics: Array.from(latestByType.values()),
      goals: goals || [],
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}

// POST /api/metrics
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId, type, value, metadata } = body
    
    if (!projectId || !type || value === undefined) {
      return NextResponse.json(
        { error: 'projectId, type, and value are required' },
        { status: 400 }
      )
    }
    
    const { data: metric, error } = await supabaseAdmin
      .from('Metric')
      .insert({
        projectId,
        type,
        value,
        metadata: metadata || {},
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(metric)
  } catch (error) {
    console.error('Error creating metric:', error)
    return NextResponse.json({ error: 'Failed to create metric' }, { status: 500 })
  }
}
