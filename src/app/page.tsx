import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Zap,
  ArrowRight,
  Github,
  Twitter,
  CreditCard,
  Globe,
  TrendingUp,
  Users,
  Code2,
  Eye,
  Activity,
  Flame
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Mission Control</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/api/auth/signin">
                <Button variant="ghost" className="text-neutral-400 hover:text-white cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/api/auth/signin">
                <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            One dashboard to rule them all
          </h1>
          <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
            Track revenue, code activity, social growth, and uptime in one place. 
            Built for indie hackers who ship.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/api/auth/signin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                Start Tracking Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features - Moved UP */}
      <section className="py-16 px-4 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Track everything that matters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Revenue"
              description="MRR, churn, and growth from Stripe"
            />
            <FeatureCard
              icon={<Github className="h-6 w-6" />}
              title="Code Activity"
              description="Commits, PRs, and shipping streaks"
            />
            <FeatureCard
              icon={<Twitter className="h-6 w-6" />}
              title="Social"
              description="Followers and engagement from Twitter/X"
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Traffic"
              description="Page views from Plausible or Google Analytics"
            />
          </div>
        </div>
      </section>

      {/* Demo Dashboard - Moved DOWN */}
      <section className="py-16 px-4 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-neutral-500 mb-4">Preview of your dashboard</p>
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Flame key={i} className="h-4 w-4 text-orange-500 fill-orange-500" />
                  ))}
                </div>
                <span className="text-sm font-medium">Ship Streak: 12 Days 🔥</span>
              </div>
              <Badge className="bg-green-500/10 text-green-500">LIVE</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DemoMetric
                icon={<TrendingUp className="h-4 w-4" />}
                label="Revenue"
                value="$1,247"
                sub="MRR"
                change="+$143 (13%)"
              />
              <DemoMetric
                icon={<Users className="h-4 w-4" />}
                label="Users"
                value="312"
                sub="total"
                change="+24 (8%)"
              />
              <DemoMetric
                icon={<Code2 className="h-4 w-4" />}
                label="Code Activity"
                value="47"
                sub="commits"
                change="+12 this week"
              />
              <DemoMetric
                icon={<Twitter className="h-4 w-4" />}
                label="Social"
                value="1.2K"
                sub="followers"
                change="+89 (8%)"
              />
              <DemoMetric
                icon={<Eye className="h-4 w-4" />}
                label="Traffic"
                value="5.4K"
                sub="views"
                change="+1.2K (28%)"
              />
              <DemoMetric
                icon={<Activity className="h-4 w-4" />}
                label="Uptime"
                value="99.9%"
                sub=""
                change="0 incidents"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to track your growth?</h2>
          <p className="text-neutral-400 mb-8">Free for personal use. No credit card required.</p>
          <Link href="/api/auth/signin">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto text-center text-neutral-500 text-sm">
          <p>© 2026 Mission Control. Built for indie hackers.</p>
        </div>
      </footer>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

function DemoMetric({ icon, label, value, sub, change }: { 
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  change: string
}) {
  return (
    <div className="bg-neutral-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-neutral-400">{label}</span>
        <div className="text-neutral-500">{icon}</div>
      </div>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold">{value}</span>
        {sub && <span className="text-sm text-neutral-400">{sub}</span>}
      </div>
      <p className="text-xs text-green-500 mt-1">{change}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
      <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center text-blue-500 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-neutral-400">{description}</p>
    </div>
  )
}
