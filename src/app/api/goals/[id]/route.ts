import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface Props {
  params: Promise<{
    id: string
  }>
}

// PATCH /api/goals/[id] - Update goal
export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    
    // Verify ownership through project
    const goal = await prisma.goal.findFirst({
      where: { id },
      include: { project: true },
    })
    
    if (!goal || goal.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }
    
    const updated = await prisma.goal.update({
      where: { id },
      data: {
        ...body,
        deadline: body.deadline ? new Date(body.deadline) : goal.deadline,
      },
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

// DELETE /api/goals/[id]
export async function DELETE(request: Request, { params }: Props) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // Verify ownership
    const goal = await prisma.goal.findFirst({
      where: { id },
      include: { project: true },
    })
    
    if (!goal || goal.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }
    
    await prisma.goal.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
