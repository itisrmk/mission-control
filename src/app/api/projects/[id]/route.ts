import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

interface Props {
  params: Promise<{
    id: string
  }>
}

// GET /api/projects/[id] - Get single project
export async function GET(request: Request, { params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { data: project, error } = await supabaseAdmin
      .from('Project')
      .select(`
        *,
        goals:Goal(*),
        metrics:Metric(*)
      `)
      .eq('id', id)
      .eq('userId', session.user.id)
      .single()
    
    if (error || !project) {
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
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    
    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('Project')
      .select('id')
      .eq('id', id)
      .eq('userId', session.user.id)
      .single()
    
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    const { data: project, error } = await supabaseAdmin
      .from('Project')
      .update({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(request: Request, { params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('Project')
      .select('id')
      .eq('id', id)
      .eq('userId', session.user.id)
      .single()
    
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    const { error } = await supabaseAdmin
      .from('Project')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
