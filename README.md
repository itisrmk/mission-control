# 🚀 Mission Control

**One dashboard to rule them all.**

Mission Control is an indie hacker metrics dashboard that aggregates data from Stripe (revenue), GitHub (commits), Twitter/X (followers), and Plausible (traffic) into a unified dashboard with public "open startup" pages.

<img width="1164" height="448" alt="Screenshot 2026-02-03 191646" src="https://github.com/user-attachments/assets/4fb303b2-eccb-4d61-8fbb-70436aabd7d4" />


## ✨ Features

- **📊 Unified Metrics Dashboard** - Track revenue, code activity, social growth, and website traffic in one place
- **🔗 Multi-Platform Integrations** - Connect Stripe, GitHub, Twitter/X, and Plausible Analytics
- **🎯 Goal Tracking** - Set and track goals with progress bars
- **🔥 Ship Streak** - Track your daily shipping streak
- **🌐 Public Pages** - Share your metrics publicly with customizable open startup pages
- **🔐 Secure** - Each user brings their own API credentials

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- (Optional) Vercel account for deployment

### 1. Clone the Repository

```bash
git clone https://github.com/itisrmk/mission-control.git
cd mission-control
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-app-secret"

# Stripe (optional - for webhook verification)
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Set Up Database

Run the Supabase migrations:

```bash
supabase db push
```

Generate TypeScript types:

```bash
npm run db:types
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating an Account

1. Visit `/auth/signup` to create an account
2. Sign in at `/auth/signin`

### Creating a Project

1. From the dashboard, click "New Project"
2. Enter a name and slug for your project
3. Click "Create Project"

### Connecting Integrations

#### GitHub
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `repo` or `public_repo` scope
3. In Mission Control Settings, enter your repo as `owner/repo`
4. Paste your token and save

#### Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a free developer account
3. Create a Project and App
4. Get your Bearer Token from "Keys and Tokens"
5. Enter your username and Bearer Token in Settings

#### Plausible Analytics
1. Go to your [Plausible Dashboard](https://plausible.io/sites)
2. Click on your site → Settings → API
3. Generate an API Key
4. Enter your Site ID (domain) and API Key in Settings

#### Stripe
1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events: `charge.succeeded`, `invoice.payment_succeeded`, `customer.subscription.created`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Paste it in Mission Control Settings

### Syncing Data

Click the "Sync" button on your project dashboard to fetch the latest metrics from all connected integrations.

### Setting Goals

1. Click "Add Goal" on your project dashboard
2. Enter a title, target value, and unit
3. Track progress as metrics sync

### Public Pages

1. Go to Project Settings
2. Enable "Public Dashboard"
3. Share the URL: `https://your-domain.com/[username]/open`

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** NextAuth.js
- **Charts:** Recharts

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add your environment variables
4. Deploy!

### Self-Hosted

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret (random string) | Yes |
| `NEXTAUTH_URL` | Your app's URL | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (optional) | No |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with love for the indie hacker community. Track everything that matters in one place.

---

**Mission Control** - Track revenue, code, social, and growth. All in one dashboard.
