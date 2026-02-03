import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

interface Props {
  params: Promise<{
    id: string
  }>
}

// PATCH /api/goals/[id] - Update goal
export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    
    // Verify ownership through project
    const { data: goal } = await supabaseAdmin
      .from('Goal')
      .select(`
        *,
        project:Project(userId)
      `)
      .eq('id', id)
      .single()
    
    if (!goal || goal.project?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }
    
    const { data: updated, error } = await supabaseAdmin
      .from('Goal')
      .update({
        ...body,
        deadline: body.deadline ? new Date(body.deadline).toISOString() : goal.deadline,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

// DELETE /api/goals/[id]
export async function DELETE(request: Request, { params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // Verify ownership
    const { data: goal } = await supabaseAdmin
      .from('Goal')
      .select(`
        *,
        project:Project(userId)
      `)
      .eq('id', id)
      .single()
    
    if (!goal || goal.project?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }
    
    const { error } = await supabaseAdmin
      .from('Goal')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
