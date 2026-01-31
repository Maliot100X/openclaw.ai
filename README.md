# 🦀 ClawAI King Booster

**Farcaster + Base Mini App for boosting coins to the top!**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Maliot100X/openclaw.ai)

## 🚀 Live Demo

**[https://openclaw-ai-one.vercel.app](https://openclaw-ai-one.vercel.app)**

---

## ✨ Features

### 📊 Real Token Data
- **Base Chain** - New & Trending tokens from GeckoTerminal
- **Zora Chain** - New & Trending tokens from GeckoTerminal  
- **Search by Contract** - Paste any 0x address to find token
- **Auto-refresh** - Data updates every 60 seconds

### 💰 Easy Trading
- **Buy Button** - Opens Uniswap with token pre-selected
- **Sell Button** - Opens Uniswap for selling
- **Explorer Link** - View token on BaseScan/Zora Explorer

### 🚀 Boost System
- **Tier 1** - $1 for 10 minutes spotlight
- **Tier 2** - $3 for 25 minutes visibility
- **Tier 3** - $6 for global boost + push notifications

### 🏆 Leaderboard
- **Real-time Rankings** - Top boosters by activity
- **Weekly Prizes** - Top 1: $50 USDC, Top 2: $25 USDC, Top 3: Free boost + $1 sub trial
- **Coins & Buyers** - Separate rankings

### 🤖 Dual AI Bots
- **OpenClaw AI** - Crypto & Farcaster assistant
- **Market Intel** - AlphaVantage-powered market signals
- **Separate Chat Histories** - Each bot has its own conversation

### 👤 Profile & Wallet
- **Farcaster Sync** - Pull profile by username or FID
- **Wallet Connections** - Base wallet, external wallet
- **Holdings View** - See your token holdings

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database | Supabase |
| Token Data | GeckoTerminal API |
| Farcaster | Neynar API |
| AI Fallback | Gemini → Groq → Mistral → ApiFree → AIMLAPI |
| Market Data | AlphaVantage MCP |
| Chains | Base, Zora |

---

## 📁 Project Structure

```
openclaw.ai/
├── app/
│   ├── api/
│   │   ├── bot/chat/         # AI chat endpoint
│   │   ├── tokens/           # Token data endpoints
│   │   ├── boosts/           # Boost management
│   │   ├── leaderboard/      # Rankings
│   │   └── user/farcaster/   # Profile sync
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── bot/                  # AI bot popup
│   ├── tabs/                 # Main app tabs
│   │   ├── HomeTab.tsx       # Spotlight + Trending
│   │   ├── TokensTab.tsx     # Base/Zora/Trending
│   │   ├── LeaderboardTab.tsx
│   │   ├── ShopTab.tsx
│   │   ├── ProfileTab.tsx
│   │   └── MoreTab.tsx
│   └── ui/                   # Reusable components
├── lib/
│   ├── ai/                   # AI router
│   ├── api/                  # External APIs
│   └── supabase/             # Database
└── types/
```

---

## 🔧 Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Neynar (Farcaster)
NEYNAR_APP_API_KEY=your_neynar_key

# AI Providers (fallback chain)
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
MISTRAL_API_KEY=your_mistral_key
APIFREE_API_KEY=your_apifree_key
AIMLAPI_API_KEY=your_aimlapi_key

# AlphaVantage
ALPHAVANTAGE_API_KEY=your_alphavantage_key

# Chains
BASE_RPC=your_base_rpc_url
ZORA_RPC=your_zora_rpc_url

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Fork this repo
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Local Development

```bash
# Clone
git clone https://github.com/Maliot100X/openclaw.ai.git
cd openclaw.ai

# Install
npm install

# Run
npm run dev
```

---

## 📋 Progress

### ✅ Phase 1: UI Complete
- [x] All 5 main tabs + More tab
- [x] Responsive mobile-first design
- [x] Farcaster Mini App compatible
- [x] Base Mini App compatible

### ✅ Phase 2: Real Data
- [x] GeckoTerminal integration (Base + Zora)
- [x] New/Trending mini-tabs for each chain
- [x] Contract address search
- [x] Farcaster profile sync via Neynar
- [x] Dual AI bots with separate histories
- [x] Buy/Sell buttons on all tokens
- [x] Boost price tiers on cards
- [x] Real leaderboard from Supabase
- [x] Prize announcements

### 🚧 Phase 3: Payments (Next)
- [ ] Onchain ETH/USDC payments
- [ ] WalletConnect integration
- [ ] Push notifications (Neynar)
- [ ] Holdings fetching
- [ ] Swap from within app

### 📅 Phase 4: Automation
- [ ] Social sharing (Twitter/Farcaster/Telegram)
- [ ] AI auto-posting settings
- [ ] Points & rewards system

---

## 🔗 Links

- **Live App**: [openclaw-ai-one.vercel.app](https://openclaw-ai-one.vercel.app)
- **GitHub**: [github.com/Maliot100X/openclaw.ai](https://github.com/Maliot100X/openclaw.ai)
- **Farcaster**: [@maliotsol](https://farcaster.xyz/maliotsol)

---

## 📄 License

MIT License - feel free to fork and build!

---

**Built with 🦀 by the ClawAI team**
