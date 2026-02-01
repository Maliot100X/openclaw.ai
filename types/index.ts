// ============================================
// Core Types for ClawAI King Booster
// ============================================

// User Types
export interface User {
  id: string
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  bio?: string
  wallets: WalletConnection[]
  subscription?: Subscription
  createdAt: string
  updatedAt: string
}

export interface WalletConnection {
  type: 'farcaster' | 'base' | 'metamask'
  address: string
  connected: boolean
  isPrimary: boolean
}

// Subscription Types
export interface Subscription {
  id: string
  userId: string
  plan: 'trial' | 'premium'
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  createdAt: string
}

// Token/Coin Types
export interface Token {
  id: string
  address: string
  name: string
  symbol: string
  chain: 'base' | 'zora' | 'ethereum' | string
  imageUrl?: string
  price?: number
  priceChange24h?: number
  marketCap?: number
  volume24h?: number
  liquidity?: number  // Total liquidity in USD
  fdv?: number        // Fully Diluted Valuation
  holders?: number
  verified: boolean
  poolAddress?: string  // DEX pool address
  createdAt?: string    // When token was created/detected
  metadata?: TokenMetadata
}

export interface TokenMetadata {
  description?: string
  website?: string
  twitter?: string
  telegram?: string
  coingeckoId?: string
}

// Boost Types
export type BoostTier = 1 | 2 | 3

export interface Boost {
  id: string
  tokenId: string
  token: Token
  userId: string
  user: User
  tier: BoostTier
  price: number
  durationMinutes: number
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
}

export interface BoostTierInfo {
  tier: BoostTier
  name: string
  price: number
  durationMinutes: number
  description: string
  features: string[]
}

export const BOOST_TIERS: BoostTierInfo[] = [
  {
    tier: 1,
    name: 'Booster I',
    price: 1,
    durationMinutes: 10,
    description: 'Basic visibility boost',
    features: ['Shown in Home section', '10 minutes visibility'],
  },
  {
    tier: 2,
    name: 'Booster II',
    price: 3,
    durationMinutes: 25,
    description: 'Enhanced visibility with badge',
    features: ['Shown in Home section', 'ClawKing badge', '25 minutes visibility'],
  },
  {
    tier: 3,
    name: 'Booster III',
    price: 6,
    durationMinutes: 60,
    description: 'Maximum visibility + notifications',
    features: [
      'TOP of Home section',
      'ClawKing Jetted badge',
      '60 minutes visibility',
      'Push notification to ALL users',
    ],
  },
]

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number
  token?: Token
  user?: User
  value: number
  change?: number
}

export type LeaderboardType = 'boosted_coins' | 'top_buyers'
export type LeaderboardPeriod = '24h' | '7d' | 'all'

// Shop Types
export interface ShopProduct {
  id: string
  type: 'booster' | 'subscription'
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
}

// AI Bot Types
export type AIProvider = 'gemini' | 'groq' | 'mistral' | 'apifree' | 'aimlapi' | 'alphavantage'

export interface BotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  provider?: AIProvider
  timestamp: string
}

export type BotMode = 'openclaw' | 'market'

// Tab Types
export type MainTab = 'home' | 'tokens' | 'leaderboard' | 'shop' | 'profile'
export type SubTab = 'holdings' | 'about' | 'github'
export type TokenSubTab = 'base' | 'zora' | 'trending'

// Navigation
export interface NavItem {
  id: MainTab
  label: string
  icon: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Holdings Types (for Profile -> Holdings tab)
export interface Holding {
  token: Token
  balance: string
  balanceUsd: number
  chain: string
}

// Farcaster specific
export interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfp: {
    url: string
  }
  profile: {
    bio: {
      text: string
    }
  }
  verifiedAddresses: {
    ethAddresses: string[]
  }
  custodyAddress: string
}
