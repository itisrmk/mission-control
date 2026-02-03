import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/goals?projectId=xxx
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
    
    const goals = await prisma.goal.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

// POST /api/goals
export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { projectId, title, description, target, unit, deadline } = body
    
    if (!projectId || !title || !target || !unit) {
      return NextResponse.json(
        { error: 'Project ID, title, target, and unit are required' },
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
    
    const goal = await prisma.goal.create({
      data: {
        projectId,
        title,
        description,
        target,
        unit,
        deadline: deadline ? new Date(deadline) : null,
      },
    })
    
    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
