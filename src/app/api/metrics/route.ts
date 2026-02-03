import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/metrics?projectId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  
  if (!projectId) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
  }
  
  try {
    // Get latest metrics for each type
    const metrics = await prisma.metric.groupBy({
      by: ['type'],
      where: { projectId },
      _max: { recordedAt: true },
    })
    
    const latestMetrics = await Promise.all(
      metrics.map(async (m) => {
        return prisma.metric.findFirst({
          where: {
            projectId,
            type: m.type,
            recordedAt: m._max.recordedAt,
          },
        })
      })
    )
    
    // Get goals
    const goals = await prisma.goal.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({
      metrics: latestMetrics.filter(Boolean),
      goals,
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
    
    const metric = await prisma.metric.create({
      data: {
        projectId,
        type,
        value,
        metadata: metadata || {},
      },
    })
    
    return NextResponse.json(metric)
  } catch (error) {
    console.error('Error creating metric:', error)
    return NextResponse.json({ error: 'Failed to create metric' }, { status: 500 })
  }
}
