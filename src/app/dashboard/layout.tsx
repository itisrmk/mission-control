import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Settings, 
  Zap,
  LogOut
} from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Mission Control</span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 text-neutral-400" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <Settings className="h-5 w-5 text-neutral-400" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center space-x-3 px-4 py-2">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center">
                {session.user.name?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-neutral-500 truncate">{session.user.email}</p>
            </div>
          </div>
          
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center space-x-3 px-4 py-2 w-full text-left text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors mt-2"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
