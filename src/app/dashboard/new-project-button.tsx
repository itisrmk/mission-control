'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'

interface NewProjectButtonProps {
  label: string
  withIcon?: boolean
  className?: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function NewProjectButton({ label, withIcon = false, className }: NewProjectButtonProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    const nameInput = window.prompt('Project name?')
    if (!nameInput) return
    const name = nameInput.trim()
    if (!name) {
      alert('Project name is required')
      return
    }

    const suggestedSlug = slugify(name)
    const slugInput = window.prompt('Project slug?', suggestedSlug || name)
    if (slugInput === null) return
    const slug = slugify(slugInput)
    if (!slug) {
      alert('Project slug is required')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to create project')
      }
      const project = await res.json()
      router.push(`/dashboard/${project.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project'
      alert(message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Button onClick={handleCreate} disabled={creating} className={className}>
      {creating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          {withIcon && <Plus className="h-4 w-4 mr-2" />}
          {label}
        </>
      )}
    </Button>
  )
}
