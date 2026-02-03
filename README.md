# Mission Control

One dashboard to rule them all. Track revenue, code, social, and growth metrics for your indie projects.

## Features

- 📊 **Unified Metrics Dashboard** - Revenue, users, code activity, social, traffic, uptime
- 🔥 **Ship Streak** - Track your shipping momentum
- 🎯 **Goals & OKRs** - Set and track quarterly goals
- 🔗 **Integrations** - Stripe, GitHub, Twitter, Plausible
- 🌐 **Public Pages** - Share your metrics at `username.missioncontrol.io/open`
- 🔐 **GitHub Auth** - Simple OAuth login

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma
- NextAuth.js
- Recharts

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repo>
   cd mission-control
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Set up the database**
   ```bash
   # Start PostgreSQL (Docker or local)
   docker run -d \
     --name missioncontrol-db \
     -e POSTGRES_USER=user \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=missioncontrol \
     -p 5432:5432 \
     postgres:15
   
   # Run migrations
   npx prisma migrate dev --name init
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

## Integrations Setup

### GitHub OAuth
1. Go to Settings → Developer settings → OAuth Apps
2. New OAuth App
3. Set callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

### Stripe (for revenue tracking)
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `invoice.payment_succeeded`, `customer.subscription.created`, etc.
4. Copy webhook secret to `.env.local`

## Project Structure

```
mission-control/
├── prisma/              # Database schema
├── src/
│   ├── app/            # Next.js app router
│   │   ├── api/        # API routes
│   │   ├── [username]/ # Public pages
│   │   └── page.tsx    # Dashboard
│   ├── components/     # React components
│   │   └── ui/         # shadcn components
│   └── lib/            # Utilities
│       ├── prisma.ts   # Database client
│       └── auth.ts     # NextAuth config
└── ...
```

## API Routes

- `GET /api/metrics?projectId=xxx` - Get metrics for a project
- `POST /api/metrics` - Record new metric
- `GET /api/auth/[...nextauth]` - Authentication

## License

MIT
