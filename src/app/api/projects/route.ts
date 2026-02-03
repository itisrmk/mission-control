import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/projects - List user's projects
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        goals: true,
        _count: {
          select: { metrics: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

// POST /api/projects - Create new project
export async function POST(request: Request) {
  const session = await auth()
  
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
    const existing = await prisma.project.findUnique({
      where: { slug },
    })
    
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already taken' },
        { status: 409 }
      )
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        domain,
        userId: session.user.id,
      },
    })
    
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
