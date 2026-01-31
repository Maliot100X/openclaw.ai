# 🦀 ClawAI King Booster

**The ultimate Farcaster & Base Mini App for boosting your favorite coins to the spotlight!**

![ClawAI King Booster](https://img.shields.io/badge/ClawAI-King%20Booster-ff6b6b?style=for-the-badge)
![Base](https://img.shields.io/badge/Base-Chain-0052FF?style=for-the-badge)
![Zora](https://img.shields.io/badge/Zora-Network-7C3AED?style=for-the-badge)
![Farcaster](https://img.shields.io/badge/Farcaster-Mini%20App-8B5CF6?style=for-the-badge)

## 🚀 Live Demo

**Production**: [https://openclaw-ai-one.vercel.app](https://openclaw-ai-one.vercel.app)

## ✨ Features

### 🏠 Home Tab
- **ClawKing Spotlight** - Featured boosted coins with countdown timers
- **Trending Section** - Live data from Base + Zora via GeckoTerminal
- **Walking Crab Animation** - Fun mascot that appears every 5 minutes!

### 💎 ClawWarTokens Tab
- **Base Coins** - [New] [Trending] sub-tabs with real-time data
- **Zora Coins** - [New] [Trending] sub-tabs with real-time data  
- **Combined Trending** - Top coins across both networks
- **Search by Contract** - Paste any 0x address to find tokens

### 🏆 Leaderboard Tab
- **Top Boosters** - Rankings with weekly prizes
- **Prizes**: 🥇 $50 USDC | 🥈 $25 USDC | 🥉 Free Boost + $1 Trial
- **Real-time scores** from Supabase

### 🛒 Shop Tab
- **Boost Tier I** - $1 for 10 min spotlight
- **ClawKing Tier II** - $3 for 25 min visibility  
- **Jetted King Tier III** - $6 for global + notifications
- **Premium Subscription** - Monthly access to all features

### 👤 Profile Tab
- **Farcaster Sync** - Enter username or FID to sync profile
- **Wallet Connections** - Farcaster, Base, MetaMask support
- **Activity Stats** - Boost history and spending

### 📦 Holdings (More Tab)
- **Real Token Balances** - Fetched from connected wallet
- **Swap/Sell** - In-app trading via Uniswap integration
- **Boost from Holdings** - One-click boost for your tokens

### 🤖 AI Bots (Floating Button)
- **OpenClaw AI** - Crypto & Farcaster assistant
- **Market Intel** - AlphaVantage-powered market signals
- **Separate Chat Histories** - Each bot has its own conversation
- **Multi-Provider Fallback** - Gemini → Groq → Mistral → ApiFree → AIMLAPI

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **APIs**: 
  - GeckoTerminal (token data)
  - Neynar (Farcaster integration)
  - AlphaVantage (market signals)
- **Wallet**: MetaMask, WalletConnect, Farcaster custody
- **Deployment**: Vercel

## 📱 Compatibility

- ✅ Farcaster Mini App (Warpcast)
- ✅ Base Mini App (Coinbase Wallet)
- ✅ Web Browser (Desktop & Mobile)
- ✅ MetaMask

## 💰 Payment Address

All boost and subscription payments go to:
```
0xccd1e099590bfedf279e239558772bbb50902ef6
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- API keys (see `.env.example`)

### Setup

```bash
# Clone the repo
git clone https://github.com/Maliot100X/openclaw.ai.git
cd openclaw.ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables:
- Supabase credentials
- Neynar API keys
- AI provider keys (Gemini, Groq, Mistral, etc.)
- Chain RPC endpoints (Base, Zora)
- WalletConnect project ID

## 📊 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/tokens` | Fetch tokens (chain, filter params) |
| `/api/tokens/search` | Search by contract address |
| `/api/boosts` | Get/create boosts |
| `/api/leaderboard` | Leaderboard rankings |
| `/api/user/farcaster` | Sync Farcaster profile |
| `/api/user/holdings` | Fetch wallet balances |
| `/api/bot/chat` | AI bot conversations |

## 🗓️ Roadmap

### ✅ Phase 1: UI Complete
- All 5 tabs + More sheet
- Bot popup with two modes
- Responsive design

### ✅ Phase 2: Real Data
- GeckoTerminal integration
- Farcaster sync via Neynar
- Supabase database
- In-app swap modal
- Walking crab animation

### 🔄 Phase 3: Payments (In Progress)
- On-chain ETH/USDC payments
- Push notifications for Tier III
- Subscription billing

### 📅 Phase 4: Social & Automation
- Auto-post to Twitter/Farcaster
- AI-powered market signals
- Points & rewards system

## 📝 License

MIT License - see [LICENSE](LICENSE)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 🔗 Links

- **Farcaster**: [@maliotsol](https://farcaster.xyz/maliotsol)
- **GitHub**: [Maliot100X/openclaw.ai](https://github.com/Maliot100X/openclaw.ai)
- **Vercel**: [openclaw-ai-one.vercel.app](https://openclaw-ai-one.vercel.app)

---

**Made with 🦀 by ClawAI Team**
