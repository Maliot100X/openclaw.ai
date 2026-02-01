// ClawAI King Booster - Constants

// Payment address - ALL purchases go here
export const PAYMENT_ADDRESS = '0xccd1e099590bfedf279e239558772bbb50902ef6'

// Chain IDs
// Chain IDs
export const CHAINS = {
  BASE: {
    id: 8453,
    name: 'Base',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  },
  ZORA: {
    id: 7777777,
    name: 'Zora',
    rpc: 'https://rpc.zora.energy',
    explorer: 'https://explorer.zora.energy',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  },
} as const

// Boost tiers (array format for easy mapping)
export const BOOST_TIERS = [
  {
    tier: 1,
    price: 1,
    duration: 10,
    name: 'Booster I',
    description: '10 min spotlight',
    features: ['Shown in Home section', '10 minutes visibility']
  },
  {
    tier: 2,
    price: 3,
    duration: 25,
    name: 'Booster II',
    description: '25 min + ClawKing badge',
    features: ['Shown in Home section', 'ClawKing badge', '25 minutes visibility']
  },
  {
    tier: 3,
    price: 6,
    duration: 60,
    name: 'Booster III',
    description: 'Global + push notifications',
    features: ['TOP of Home section', 'ClawKing Jetted badge', '60 minutes visibility', 'Push notification to ALL users']
  },
] as const

// Helper to get tier by number
export const getBoostTier = (tier: number) => {
  const found = BOOST_TIERS.find(t => t.tier === tier)
  return found || BOOST_TIERS[0]
}

// USDC addresses
export const USDC_ADDRESS = {
  base: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  zora: '0x', // Zora uses bridged USDC
} as const

// DEX URLs for swaps
export const DEX_URLS = {
  base: {
    uniswap: 'https://app.uniswap.org/swap',
    // For in-app swap frames
    baseSwap: 'https://baseswap.fi/swap',
  },
  zora: {
    uniswap: 'https://app.uniswap.org/swap', // Uniswap supports Zora
  },
} as const

// Leaderboard prizes
export const LEADERBOARD_PRIZES = {
  1: { amount: 50, currency: 'USDC', label: '🥇 $50 USDC' },
  2: { amount: 25, currency: 'USDC', label: '🥈 $25 USDC' },
  3: { amount: 0, currency: 'FREE', label: '🥉 Free Boost + $1 Trial' },
} as const
