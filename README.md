# 🦀 ClawAI King Booster

> **Boost your coins to the top!** A Farcaster Mini App for token discovery and promotion on Base & Zora.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Maliot100X/openclaw.ai)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Base](https://img.shields.io/badge/Base-Chain-0052FF?style=for-the-badge)
![Farcaster](https://img.shields.io/badge/Farcaster-Mini%20App-7C3AED?style=for-the-badge)

---

## ✨ Features

### 🚀 Coin Boosting System
Promote any token to the ClawKing Spotlight!

| Tier | Price | Duration | Visibility |
|------|-------|----------|------------|
| **Booster I** | $1 | 10 min | Home section |
| **Booster II** | $3 | 25 min | Home + ClawKing badge |
| **Booster III** | $6 | 60 min | Top of Home + Push notification to ALL users |

### 🤖 AI Assistants
Dual-mode AI powered by multi-provider fallback system:

- **OpenClaw AI** - Crypto & Farcaster assistant
- **Market Intel** - Real-time market data (AlphaVantage)

**AI Fallback Chain:** Gemini → Groq → Mistral → ApiFree → AIMLAPI

### 🏆 Leaderboards
- Top Boosted Coins (24h / 7d / All Time)
- Top Boost Buyers

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
| **Home** | 🏠 | ClawKing Spotlight + Trending coins |
| **ClawWarTokens** | 🪙 | Base / Zora / Trending sub-tabs |
| **Leaderboard** | 🏆 | Top coins & buyers rankings |
| **Shop** | 🛒 | Boosters & Subscriptions |
| **Profile** | 👤 | Wallet connections (3 required) |
| **More** | ➕ | Holdings, About, GitHub |

### Required Wallet Connections
1. 🟣 **Farcaster Wallet** - Auto-detected with sync button
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
2. Go to SQL Editor
3. Copy contents of `lib/supabase/schema.sql`
4. Run the SQL to create tables
5. Copy your project URL and keys to `.env.local`

---

## 🔐 Environment Variables

Create `.env.local` (this file is gitignored and stays private):

```env
# SUPABASE (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NEYNAR / FARCASTER (Required)
NEYNAR_API_KEY=your_neynar_api_key
NEYNAR_CLIENT_ID=your_neynar_client_id
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_client_id

# AI PROVIDERS - Fallback Chain (at least one required)
GEMINI_API_KEY=your_gemini_key           # Primary
GROQ_API_KEY=your_groq_key               # Fallback 1
MISTRAL_API_KEY=your_mistral_key         # Fallback 2
APIFREE_API_KEY=your_apifree_key         # Fallback 3
AIMLAPI_API_KEY=your_aimlapi_key         # Fallback 4

# MARKET DATA
ALPHAVANTAGE_API_KEY=your_alphavantage_key

# BLOCKCHAIN RPC
BASE_RPC=https://mainnet.base.org
ZORA_RPC=https://rpc.zora.energy

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
| **Blockchain** | viem, wagmi |
| **State** | TanStack Query, Zustand |
| **AI** | Multi-provider router |

---

## 📁 Project Structure

```
openclaw.ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── bot/chat/      # AI bot endpoint
│   ├── page.tsx           # Main app with tabs
│   ├── layout.tsx         # Root layout + metadata
│   ├── providers.tsx      # React Query provider
│   └── globals.css        # Global styles
├── components/
│   ├── bot/               # AI bot popup
│   ├── navigation/        # Bottom nav, More sheet
│   ├── tabs/              # All main tab components
│   ├── ui/                # Reusable UI (CoinCard, etc.)
│   └── views/             # Sub-views (Holdings, About)
├── lib/
│   ├── ai/                # AI router + providers
│   │   ├── router.ts      # Main router with fallback
│   │   └── providers/     # Individual AI providers
│   └── supabase/          # Database client + schema
├── types/                 # TypeScript definitions
├── public/                # Static assets
├── .env.example           # Example environment file
└── package.json           # Dependencies
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add all environment variables from `.env.local`
5. Deploy!

### Post-Deployment Checklist

- [ ] Update `NEXT_PUBLIC_APP_URL` with your Vercel domain
- [ ] Add domain to Farcaster Mini App settings on Neynar
- [ ] Test wallet connections on all platforms
- [ ] Verify AI bot responds correctly
- [ ] Run Supabase migrations if not done

---

## 📜 API Keys Reference

| Service | Purpose | Free Tier | Get it at |
|---------|---------|-----------|----------|
| **Supabase** | Database & Auth | ✅ Yes | [supabase.com](https://supabase.com) |
| **Neynar** | Farcaster API | ✅ Yes | [neynar.com](https://neynar.com) |
| **Gemini** | AI (primary) | ✅ Yes | [ai.google.dev](https://ai.google.dev) |
| **Groq** | AI (fast inference) | ✅ Yes | [console.groq.com](https://console.groq.com) |
| **Mistral** | AI (fallback) | ✅ Yes | [console.mistral.ai](https://console.mistral.ai) |
| **ApiFree** | AI (fallback) | ✅ Yes | [apifree.ai](https://apifree.ai) |
| **AIMLAPI** | AI (fallback) | ✅ Yes | [aimlapi.com](https://aimlapi.com) |
| **AlphaVantage** | Market data | ✅ Yes | [alphavantage.co](https://alphavantage.co) |
| **WalletConnect** | Wallet connect | ✅ Yes | [cloud.walletconnect.com](https://cloud.walletconnect.com) |

---

## 🗓️ Roadmap

### Phase 1 (Current) ✅
- [x] Complete UI for all 5 tabs + More
- [x] AI Bot with multi-provider fallback
- [x] Mock data for development
- [x] Farcaster Mini App compatibility
- [x] Base Mini App compatibility
- [x] Responsive design

### Phase 2 (Next)
- [ ] Real onchain payments (ETH/USDC)
- [ ] Live token data from GeckoTerminal/Zora APIs
- [ ] Push notifications (Neynar)
- [ ] Full wallet integration
- [ ] User authentication

### Phase 3 (Future)
- [ ] Social sharing rewards
- [ ] Points & gamification system
- [ ] Telegram bot integration
- [ ] Advanced analytics dashboard
- [ ] Token creation support

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

## Made With ❤️ From **Clawn.AI**

### (Base / Farcaster)

<br>

By [@maliotsol](https://warpcast.com/maliotsol)

---

🦀 **Boost your coins. Rule the claw.** 🦀

</div>
