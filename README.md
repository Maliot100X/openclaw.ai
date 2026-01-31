# 🦀 ClawAI King Booster

> **Boost your coins to the top!** A Farcaster Mini App for token discovery and promotion on Base & Zora.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Maliot100X/openclaw.ai)
[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge)](https://openclaw-ai-one.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Base](https://img.shields.io/badge/Base-Chain-0052FF?style=for-the-badge)
![Farcaster](https://img.shields.io/badge/Farcaster-Mini%20App-7C3AED?style=for-the-badge)

---

## 🌐 Live Demo

**Production URL:** https://openclaw-ai-one.vercel.app

Test as Farcaster Mini App in [Warpcast Developer Tools](https://warpcast.com/~/developers)

---

## ✨ Features

### 🚀 Coin Boosting System
Promote any token to the ClawKing Spotlight!

| Tier | Price | Duration | Visibility |
|------|-------|----------|------------|
| **Booster I** | $1 | 10 min | Home section |
| **Booster II** | $3 | 25 min | Home + ClawKing badge |
| **Booster III** | $6 | 60 min | Top of Home + Push notification to ALL users |

### 📊 Real Token Data
- **Live token prices** from GeckoTerminal API
- **Base & Zora chains** supported
- **Search by contract address** - paste any 0x address
- **Real trending tokens** - updated every 60 seconds

### 🤖 Dual AI Assistants
Two separate AI bots with independent chat histories:

| Bot | Purpose | Features |
|-----|---------|----------|
| **OpenClaw AI** | Crypto & Farcaster helper | Answer questions, help with boosting |
| **Market Intel** | Real-time market data | AlphaVantage integration, signals |

**AI Fallback Chain:** Gemini → Groq → Mistral → ApiFree → AIMLAPI (24/7 uptime)

### 🏆 Leaderboards with Real Prizes
- Top Boosted Coins (24h / 7d / All Time)
- Top Boost Buyers

**Weekly Prizes (Paid to winner's wallet every Monday):**
- 🥇 1st Place: $50 USDC
- 🥈 2nd Place: $25 USDC  
- 🥉 3rd Place: Free boost + $1 trial subscription

### 👤 Profile & Wallets
- **Farcaster Sync** - Enter username or FID to fetch real profile data
- **Base Wallet** - Connect via WalletConnect for payments
- **MetaMask** - Connect for web browser access

### 💎 Premium Subscription
| Plan | Price | Duration | Perks |
|------|-------|----------|-------|
| **Trial** | $1 | 7 days | Full access, 10% boost discount |
| **Premium** | $15 | 30 days | 20% discount, priority placement, unlimited AI, exclusive badge |

### 🔗 Multi-Chain Support
- 🔵 Base Chain (primary)
- 🟣 Zora Network
- 🤖 Clanker Tokens

---

## 📱 App Structure

### Main Tabs (5 + More)
| Tab | Icon | Description |
|-----|------|-------------|
| **Home** | 🏠 | ClawKing Spotlight + Real trending coins |
| **ClawWarTokens** | 🪙 | Base / Zora / Trending (live from GeckoTerminal) |
| **Leaderboard** | 🏆 | Real rankings from Supabase |
| **Shop** | 🛒 | Boosters & Subscriptions |
| **Profile** | 👤 | Farcaster sync + wallet connections |
| **More** | ➕ | Holdings, About, GitHub |

### Required Wallet Connections
1. 🟣 **Farcaster Wallet** - Sync via username or FID
2. 🔵 **Base Wallet** - For Base Mini App (WalletConnect)
3. 🦊 **MetaMask/Web3** - For web browser access

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Neynar API key (for Farcaster)

### Installation

```bash
# Clone the repo
git clone https://github.com/Maliot100X/openclaw.ai.git
cd openclaw.ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your API keys in .env.local

# Run database migrations (see Database Setup)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → New Query
3. Copy contents of `lib/supabase/schema.sql`
4. Run the SQL to create tables
5. Copy your project URL and keys to `.env.local`

---

## 🔐 Environment Variables

Create `.env.local` (this file is gitignored):

```env
# SUPABASE (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NEYNAR / FARCASTER (Required)
NEYNAR_APP_API_KEY=your_neynar_api_key
NEYNAR_APP_CLIENT_ID=your_neynar_client_id

# AI PROVIDERS - Fallback Chain (at least one required)
GEMINI_API_KEY=your_gemini_key           # Primary
GROQ_API_KEY=your_groq_key               # Fallback 1
MISTRAL_API_KEY=your_mistral_key         # Fallback 2
APIFREE_API_KEY=your_apifree_key         # Fallback 3
AIMLAPI_API_KEY=your_aimlapi_key         # Fallback 4

# MARKET DATA
ALPHAVANTAGE_API_KEY=your_alphavantage_key
GECKOTERMINAL_BASE_URL=https://api.geckoterminal.com/api/v2

# BLOCKCHAIN RPC
BASE_RPC=https://mainnet.base.org
ZORA_RPC=https://rpc.zora.energy

# WALLETCONNECT
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# APP
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion 11 |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Farcaster (Neynar SDK) |
| **Token Data** | GeckoTerminal API |
| **AI** | Multi-provider router |
| **Wallets** | WalletConnect v2 |

---

## 📁 Project Structure

```
openclaw.ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── bot/chat/      # AI bot endpoint
│   │   ├── tokens/        # Token data (GeckoTerminal)
│   │   ├── tokens/search/ # Contract address search
│   │   ├── boosts/        # Active boosts (Supabase)
│   │   ├── leaderboard/   # Rankings (Supabase)
│   │   └── user/farcaster # Farcaster profile sync
│   ├── page.tsx           # Main app with tabs
│   ├── layout.tsx         # Root layout + metadata
│   └── globals.css        # Global styles
├── components/
│   ├── bot/               # AI bot popup (2 tabs)
│   ├── navigation/        # Bottom nav, More sheet
│   ├── tabs/              # All main tab components
│   ├── ui/                # Reusable UI (CoinCard, etc.)
│   └── views/             # Sub-views (Holdings, About)
├── lib/
│   ├── ai/                # AI router + providers
│   ├── api/               # External API helpers
│   │   └── geckoterminal.ts
│   └── supabase/          # Database client + schema
├── types/                 # TypeScript definitions
└── public/                # Static assets
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add all environment variables
5. Deploy!

### Post-Deployment Checklist

- [x] Update `NEXT_PUBLIC_APP_URL` with your Vercel domain
- [x] Add domain to Zora API allowlist
- [x] Run Supabase migrations
- [ ] Test wallet connections on mobile
- [ ] Test in Farcaster Mini App viewer
- [ ] Verify AI bot responds correctly

---

## 🗓️ Development Roadmap

### Phase 1 ✅ Complete
- [x] Complete UI for all 5 tabs + More
- [x] AI Bot with multi-provider fallback
- [x] Farcaster Mini App compatible (iframe headers)
- [x] Base Mini App compatible
- [x] Responsive mobile-first design

### Phase 2 ✅ Complete (Real Data)
- [x] Real token data from GeckoTerminal API
- [x] Contract address search
- [x] Real Farcaster profile sync (Neynar)
- [x] Leaderboard from Supabase
- [x] Active boosts from Supabase
- [x] Prize announcement system
- [x] Separate AI bot chat histories

### Phase 3 🔄 In Progress
- [ ] Onchain payments (ETH/USDC via Base)
- [ ] Push notifications (Neynar Mini App API)
- [ ] Full WalletConnect v2 integration
- [ ] User holdings fetch (from wallets)
- [ ] Boost creation flow

### Phase 4 📋 Planned
- [ ] Social sharing (Farcaster, Twitter, Telegram)
- [ ] AI auto-posting (Market Intel signals)
- [ ] Points & gamification
- [ ] Telegram bot

---

## 📜 API Reference

### Tokens
```
GET /api/tokens?chain=base|zora|trending&page=1
GET /api/tokens/search?address=0x...&chain=base
```

### Boosts
```
GET /api/boosts?limit=5
POST /api/boosts (create boost)
```

### Leaderboard
```
GET /api/leaderboard?type=boosted_coins|top_buyers&period=24h|7d|all
```

### User
```
GET /api/user/farcaster?fid=12345
GET /api/user/farcaster?username=vitalik
```

### AI Bot
```
POST /api/bot/chat
{ "message": "...", "mode": "openclaw|market", "history": [...] }
```

---

## 🔑 API Keys Reference

| Service | Purpose | Free Tier | Get it at |
|---------|---------|-----------|----------|
| **Supabase** | Database | ✅ Yes | [supabase.com](https://supabase.com) |
| **Neynar** | Farcaster API | ✅ Yes | [neynar.com](https://neynar.com) |
| **GeckoTerminal** | Token data | ✅ Free | No key needed |
| **Gemini** | AI (primary) | ✅ Yes | [ai.google.dev](https://ai.google.dev) |
| **Groq** | AI (fast) | ✅ Yes | [console.groq.com](https://console.groq.com) |
| **AlphaVantage** | Market data | ✅ Yes | [alphavantage.co](https://alphavantage.co) |
| **WalletConnect** | Wallet connect | ✅ Yes | [cloud.walletconnect.com](https://cloud.walletconnect.com) |

---

## 🤝 Contributing

Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

## Made With ❤️ By **Clawn.AI**

### (Base / Farcaster)

By [@maliotsol](https://warpcast.com/maliotsol)

---

🦀 **Boost your coins. Rule the claw.** 🦀

</div>
