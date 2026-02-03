import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface Props {
  params: Promise<{
    id: string
  }>
}

// GET /api/projects/[id] - Get single project
export async function GET(request: Request, { params }: Props) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        goals: true,
        metrics: {
          orderBy: { recordedAt: 'desc' },
          take: 100,
        },
      },
    })
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    
    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })
    
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    const project = await prisma.project.update({
      where: { id },
      data: body,
    })
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(request: Request, { params }: Props) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })
    
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    await prisma.project.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
