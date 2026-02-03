import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET /api/goals?projectId=xxx
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
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
    const { data: project, error: projectError } = await supabaseAdmin
      .from('Project')
      .select('id')
      .eq('id', projectId)
      .eq('userId', session.user.id)
      .single()
    
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    const { data: goals, error } = await supabaseAdmin
      .from('Goal')
      .select('*')
      .eq('projectId', projectId)
      .order('createdAt', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(goals || [])
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

// POST /api/goals
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
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
    const { data: project, error: projectError } = await supabaseAdmin
      .from('Project')
      .select('id')
      .eq('id', projectId)
      .eq('userId', session.user.id)
      .single()
    
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    const { data: goal, error } = await supabaseAdmin
      .from('Goal')
      .insert({
        projectId,
        title,
        description,
        target,
        unit,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
