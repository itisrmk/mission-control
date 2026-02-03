"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Code2, 
  Twitter, 
  Eye, 
  Activity,
  Flame,
  Rocket,
  Target,
  Share2,
  Zap
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const revenueData = [
  { name: "Jan", value: 800 },
  { name: "Feb", value: 950 },
  { name: "Mar", value: 1100 },
  { name: "Apr", value: 1050 },
  { name: "May", value: 1247 },
];

const trafficData = [
  { name: "Mon", views: 1200 },
  { name: "Tue", views: 1800 },
  { name: "Wed", views: 2400 },
  { name: "Thu", views: 2100 },
  { name: "Fri", views: 2800 },
  { name: "Sat", views: 3200 },
  { name: "Sun", views: 5400 },
];

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  subtitle?: string;
}

function MetricCard({ title, value, change, changeType, icon, subtitle }: MetricCardProps) {
  const changeColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-gray-500",
  };

  const ChangeIcon = changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : Activity;

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-400">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="flex items-center text-xs mt-1">
          <ChangeIcon className={`h-3 w-3 mr-1 ${changeColors[changeType]}`} />
          <span className={changeColors[changeType]}>{change}</span>
          {subtitle && <span className="text-neutral-500 ml-2">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">Mission Control</h1>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                LIVE
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-neutral-400">myproject.com</span>
              <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ship Streak Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 via-red-500/10 to-purple-500/10 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Flame key={i} className="h-6 w-6 text-orange-500 fill-orange-500" />
                ))}
              </div>
              <div>
                <h2 className="text-lg font-semibold">Ship Streak: 12 Days 🔥</h2>
                <p className="text-neutral-400 text-sm">Last launch: Photo AI v2.1 (3 days ago)</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors text-sm font-medium">
              Launch Something
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Revenue"
            value="$1,247 MRR"
            change="+$143 (13%)"
            changeType="positive"
            icon={<TrendingUp className="h-4 w-4" />}
            subtitle="vs last month"
          />
          <MetricCard
            title="Users"
            value="312 total"
            change="+24 (8%)"
            changeType="positive"
            icon={<Users className="h-4 w-4" />}
            subtitle="vs last month"
          />
          <MetricCard
            title="Code Activity"
            value="47 commits"
            change="+12 this week"
            changeType="positive"
            icon={<Code2 className="h-4 w-4" />}
            subtitle="8 pull requests"
          />
          <MetricCard
            title="Social"
            value="1.2K followers"
            change="+89 (8%)"
            changeType="positive"
            icon={<Twitter className="h-4 w-4" />}
            subtitle="Twitter/X"
          />
          <MetricCard
            title="Traffic"
            value="5.4K views"
            change="+1.2K (28%)"
            changeType="positive"
            icon={<Eye className="h-4 w-4" />}
            subtitle="last 7 days"
          />
          <MetricCard
            title="Uptime"
            value="99.9%"
            change="0 incidents"
            changeType="positive"
            icon={<Activity className="h-4 w-4" />}
            subtitle="last 30 days"
          />
        </div>

        {/* Charts & Goals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Revenue Trend</CardTitle>
              <CardDescription className="text-neutral-400">Monthly recurring revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="name" stroke="#525252" fontSize={12} />
                  <YAxis stroke="#525252" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626' }}
                    labelStyle={{ color: '#a3a3a3' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Traffic Chart */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Traffic Overview</CardTitle>
              <CardDescription className="text-neutral-400">Page views over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="name" stroke="#525252" fontSize={12} />
                  <YAxis stroke="#525252" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626' }}
                    labelStyle={{ color: '#a3a3a3' }}
                  />
                  <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Goals Section */}
        <div className="mt-8">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-white">Q1 2026 Goals</CardTitle>
              </div>
              <CardDescription className="text-neutral-400">Track your progress towards key milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-300">$5K MRR</span>
                  <span className="text-neutral-400">$1,247 / $5,000 (24%)</span>
                </div>
                <Progress value={24} className="h-2 bg-neutral-800" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-300">1,000 Users</span>
                  <span className="text-neutral-400">312 / 1,000 (31%)</span>
                </div>
                <Progress value={31} className="h-2 bg-neutral-800" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-300">3 Launches</span>
                  <span className="text-neutral-400">2 / 3 (67%)</span>
                </div>
                <Progress value={67} className="h-2 bg-neutral-800" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-300">5K Twitter Followers</span>
                  <span className="text-neutral-400">1,200 / 5,000 (24%)</span>
                </div>
                <Progress value={24} className="h-2 bg-neutral-800" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500 mb-3">Connected Integrations</p>
          <div className="flex justify-center space-x-4">
            {["Stripe", "GitHub", "Twitter", "Plausible", "Uptime"].map((integration) => (
              <Badge key={integration} variant="secondary" className="bg-neutral-800 text-neutral-400 border-neutral-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />
                {integration}
              </Badge>
            ))}
            <Badge variant="secondary" className="bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700 cursor-pointer">
              + Add more
            </Badge>
          </div>
        </div>
      </main>
    </div>
  );
}
