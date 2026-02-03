import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ExternalLink, Settings } from 'lucide-react'
import NewProjectButton from './new-project-button'

export default async function DashboardPage() {
  let session
  try {
    session = await getServerSession(authOptions)
  } catch (e) {
    console.error('Session error:', e)
  }
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  let projects: any[] = []
  try {
    const { data, error } = await supabaseAdmin
      .from('Project')
      .select(`
        *,
        metrics:Metric(count),
        goals:Goal(count)
      `)
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })
    
    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      projects = data || []
    }
  } catch (e) {
    console.error('Exception fetching projects:', e)
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Projects</h1>
            <p className="text-neutral-400 mt-1">Manage your indie projects and track their metrics</p>
          </div>
          
          <NewProjectButton
            label="New Project"
            withIcon
            className="bg-blue-600 hover:bg-blue-700"
          />
        </div>

        {projects.length === 0 ? (
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-neutral-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-neutral-400 mb-4">Create your first project to start tracking metrics</p>
              <NewProjectButton
                label="Create Project"
                className="bg-blue-600 hover:bg-blue-700"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <Card key={project.id} className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <CardDescription className="text-neutral-400 mt-1">
                        {project.description || 'No description'}
                      </CardDescription>
                    </div>
                    {project.isPublic && (
                      <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                        Public
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 text-sm text-neutral-400 mb-4">
                    <span>{project.metrics?.[0]?.count || 0} metrics</span>
                    <span>{project.goals?.[0]?.count || 0} goals</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-neutral-700">
                        View Dashboard
                      </Button>
                    </Link>
                    
                    <Link href={`/dashboard/${project.id}/settings`}>
                      <Button variant="outline" size="icon" className="border-neutral-700">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    {project.isPublic && (
                      <Link href={`/${project.slug}/open`} target="_blank">
                        <Button variant="outline" size="icon" className="border-neutral-700">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
