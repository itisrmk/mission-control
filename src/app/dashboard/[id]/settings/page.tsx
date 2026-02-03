'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Github, 
  Twitter, 
  CreditCard, 
  Globe,
  Check,
  X,
  Loader2
} from 'lucide-react'

interface Project {
  id: string
  name: string
  slug: string
  isPublic: boolean
  stripeAccountId: string | null
  githubRepo: string | null
  githubAccessToken: string | null
  twitterHandle: string | null
  twitterAccessToken: string | null
  plausibleSiteId: string | null
  plausibleApiKey: string | null
}

interface Props {
  params: Promise<{
    id: string
  }>
}

export default function ProjectSettings({ params }: Props) {
  const { id } = React.use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncingIntegration, setSyncingIntegration] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Project>>({})

  useEffect(() => {
    fetchProject()
  }, [id])

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProject(data)
        setFormData({
          githubRepo: data.githubRepo || '',
          githubAccessToken: data.githubAccessToken || '',
          twitterHandle: data.twitterHandle || '',
          twitterAccessToken: data.twitterAccessToken || '',
          plausibleSiteId: data.plausibleSiteId || '',
          plausibleApiKey: data.plausibleApiKey || '',
          isPublic: data.isPublic,
        })
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to save')
      }
      const updated = await res.json()
      setProject(updated)
      alert('Settings saved!')
    } catch (error) {
      console.error('Error saving:', error)
      const message = error instanceof Error ? error.message : 'Failed to save'
      alert(message)
    } finally {
      setSaving(false)
    }
  }

  const [syncError, setSyncError] = useState<string | null>(null)

  async function testSync(integration: string) {
    setSyncingIntegration(integration)
    setSyncError(null)
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, integration }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data?.error || 'Sync failed')
      }
      
      // Check for integration-specific errors
      const integrationError = data.results?.[integration]?.error
      if (integrationError) {
        setSyncError(`${integration}: ${integrationError}`)
        return
      }
      
      if (data.success) {
        alert(`${integration} sync successful! Refresh to see updated data.`)
      } else {
        setSyncError(`${integration} sync failed: Unknown error`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed'
      setSyncError(message)
    } finally {
      setSyncingIntegration(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white">
        Project not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-neutral-400 mt-1">Configure integrations and settings</p>
        </div>

        <div className="space-y-6">
          {/* Public Page Toggle */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle>Public Dashboard</CardTitle>
              <CardDescription className="text-neutral-400">
                Share your metrics publicly at /{project.slug}/open
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, isPublic: checked })
                  }
                />
                <Label>
                  {formData.isPublic ? (
                    <span className="flex items-center text-green-500">
                      <Check className="h-4 w-4 mr-1" /> Public
                    </span>
                  ) : (
                    <span className="flex items-center text-neutral-500">
                      <X className="h-4 w-4 mr-1" /> Private
                    </span>
                  )}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Integration */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Github className="h-5 w-5" />
                  <CardTitle>GitHub</CardTitle>
                </div>
                {project.githubRepo && (
                  <Badge className="bg-green-500/10 text-green-500">Connected</Badge>
                )}
              </div>
              <CardDescription className="text-neutral-400">
                Track commits and pull requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Repository (owner/repo)</Label>
                <Input
                  value={formData.githubRepo || ''}
                  onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                  placeholder="e.g., rahulkashyap/mission-control"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Personal Access Token</Label>
                <Input
                  type="password"
                  value={formData.githubAccessToken || ''}
                  onChange={(e) => setFormData({ ...formData, githubAccessToken: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="bg-neutral-800 border-neutral-700"
                />
                <p className="text-xs text-neutral-500">
                  Create at GitHub → Settings → Developer settings → Personal access tokens
                </p>
              </div>
              {project.githubRepo && (
                <Button 
                  variant="outline" 
                  onClick={() => testSync('github')}
                  disabled={syncingIntegration === 'github'}
                  className="border-neutral-700 text-white hover:text-white hover:bg-neutral-800"
                >
                  {syncingIntegration === 'github' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Test Sync'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Twitter/X Integration */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Twitter className="h-5 w-5" />
                  <CardTitle>Twitter / X</CardTitle>
                </div>
                {project.twitterHandle && (
                  <Badge className="bg-green-500/10 text-green-500">Connected</Badge>
                )}
              </div>
              <CardDescription className="text-neutral-400">
                Track followers and engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={formData.twitterHandle || ''}
                  onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                  placeholder="@username"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Bearer Token</Label>
                <Input
                  type="password"
                  value={formData.twitterAccessToken || ''}
                  onChange={(e) => setFormData({ ...formData, twitterAccessToken: e.target.value })}
                  placeholder="AAAAAAAAAAAAAAAAAAAAAA..."
                  className="bg-neutral-800 border-neutral-700"
                />
                <p className="text-xs text-neutral-500">
                  Get from <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener" className="text-blue-400 hover:underline">Twitter Developer Portal</a> → Projects → Keys and Tokens
                </p>
              </div>
              {project.twitterHandle && (
                <Button 
                  variant="outline" 
                  onClick={() => testSync('twitter')}
                  disabled={syncingIntegration === 'twitter'}
                  className="border-neutral-700 text-white hover:text-white hover:bg-neutral-800"
                >
                  {syncingIntegration === 'twitter' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Test Sync'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Plausible Integration */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>Plausible Analytics</CardTitle>
                </div>
                {project.plausibleSiteId && (
                  <Badge className="bg-green-500/10 text-green-500">Connected</Badge>
                )}
              </div>
              <CardDescription className="text-neutral-400">
                Track page views and visitors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Site ID (Domain)</Label>
                <Input
                  value={formData.plausibleSiteId || ''}
                  onChange={(e) => setFormData({ ...formData, plausibleSiteId: e.target.value })}
                  placeholder="e.g., example.com"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={formData.plausibleApiKey || ''}
                  onChange={(e) => setFormData({ ...formData, plausibleApiKey: e.target.value })}
                  placeholder="your-plausible-api-key"
                  className="bg-neutral-800 border-neutral-700"
                />
                <p className="text-xs text-neutral-500">
                  Get from your Plausible site settings → API
                </p>
              </div>
              {project.plausibleSiteId && (
                <Button 
                  variant="outline" 
                  onClick={() => testSync('plausible')}
                  disabled={syncingIntegration === 'plausible'}
                  className="border-neutral-700 text-white hover:text-white hover:bg-neutral-800"
                >
                  {syncingIntegration === 'plausible' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Test Sync'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Stripe - Read Only */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Stripe</CardTitle>
              </div>
              <CardDescription className="text-neutral-400">
                Revenue tracking via webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-neutral-800 p-3 rounded-lg text-sm text-neutral-400">
                <p>Stripe is configured via webhooks. Set up your webhook endpoint in Stripe Dashboard:</p>
                <code className="block mt-2 bg-neutral-900 p-2 rounded text-xs">
                  POST /api/webhooks/stripe
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {syncError && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <strong>Sync Error:</strong> {syncError}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
