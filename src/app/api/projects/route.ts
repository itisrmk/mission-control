import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET /api/projects - List user's projects
export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { data: projects, error } = await supabaseAdmin
      .from('Project')
      .select(`
        *,
        goals:Goal(*),
        metrics:Metric(count)
      `)
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(projects || [])
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

// POST /api/projects - Create new project
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { name, slug, description, domain } = body
    
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }
    
    // Check if slug is unique
    const { data: existing } = await supabaseAdmin
      .from('Project')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already taken' },
        { status: 409 }
      )
    }
    
    const { data: project, error } = await supabaseAdmin
      .from('Project')
      .insert({
        name,
        slug,
        description,
        domain,
        userId: session.user.id,
      } as any)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
