'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Search, Coins, Sparkles, TrendingUp } from 'lucide-react'
import CoinCard from '@/components/ui/CoinCard'
import type { Token, TokenSubTab } from '@/types'

// Mock data - will be replaced with real API calls
const mockBaseCoins: Token[] = [
  {
    id: 'b1',
    address: '0xbase1...',
    name: 'Based Chad',
    symbol: 'CHAD',
    chain: 'base',
    imageUrl: 'https://via.placeholder.com/100/0052FF/fff?text=CHAD',
    price: 0.00234,
    priceChange24h: 18.5,
    volume24h: 456000,
    verified: true,
  },
  {
    id: 'b2',
    address: '0xbase2...',
    name: 'Brett',
    symbol: 'BRETT',
    chain: 'base',
    imageUrl: 'https://via.placeholder.com/100/0052FF/fff?text=BRETT',
    price: 0.089,
    priceChange24h: 5.2,
    volume24h: 1200000,
    verified: true,
  },
  {
    id: 'b3',
    address: '0xbase3...',
    name: 'Degen',
    symbol: 'DEGEN',
    chain: 'base',
    imageUrl: 'https://via.placeholder.com/100/0052FF/fff?text=DEGEN',
    price: 0.012,
    priceChange24h: -3.8,
    volume24h: 890000,
    verified: true,
  },
]

const mockZoraCoins: Token[] = [
  {
    id: 'z1',
    address: '0xzora1...',
    name: 'Zorb',
    symbol: 'ZORB',
    chain: 'zora',
    imageUrl: 'https://via.placeholder.com/100/5B21B6/fff?text=ZORB',
    price: 0.00089,
    priceChange24h: 32.1,
    volume24h: 234000,
    verified: true,
  },
  {
    id: 'z2',
    address: '0xzora2...',
    name: 'Enjoy',
    symbol: 'ENJOY',
    chain: 'zora',
    imageUrl: 'https://via.placeholder.com/100/5B21B6/fff?text=ENJOY',
    price: 0.00156,
    priceChange24h: 12.4,
    volume24h: 567000,
    verified: true,
  },
]

const mockTrendingCoins: Token[] = [
  ...mockBaseCoins.slice(0, 2),
  ...mockZoraCoins.slice(0, 1),
].sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0))

const subTabs: { id: TokenSubTab; label: string; icon: typeof Coins }[] = [
  { id: 'base', label: 'Base', icon: Coins },
  { id: 'zora', label: 'Zora', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
]

export default function TokensTab() {
  const [activeSubTab, setActiveSubTab] = useState<TokenSubTab>('base')
  const [searchQuery, setSearchQuery] = useState('')

  const getCoinsForTab = () => {
    switch (activeSubTab) {
      case 'base':
        return mockBaseCoins
      case 'zora':
        return mockZoraCoins
      case 'trending':
        return mockTrendingCoins
      default:
        return []
    }
  }

  const filteredCoins = getCoinsForTab().filter((coin) =>
    searchQuery === '' ||
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Coins className="text-claw-primary" size={28} />
        <h1 className="text-2xl font-bold">ClawWarTokens</h1>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 bg-claw-dark/50 p-1 rounded-xl">
        {subTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-claw-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-claw-dark/50 border border-white/10 rounded-xl focus:outline-none focus:border-claw-primary transition-colors"
        />
      </div>

      {/* Info Banner */}
      <div className="card bg-gradient-to-r from-claw-primary/20 to-claw-secondary/20 border-claw-primary/30">
        <p className="text-sm">
          <span className="font-semibold">💡 Tip:</span> Boost any coin to the ClawKing Spotlight!
          The higher the tier, the more visibility.
        </p>
      </div>

      {/* Coin List */}
      <div className="space-y-3">
        {filteredCoins.length > 0 ? (
          filteredCoins.map((token, index) => (
            <CoinCard
              key={token.id}
              token={token}
              index={index}
              showBoostButton={true}
            />
          ))
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-400">No tokens found</p>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
            )}
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredCoins.length > 0 && (
        <button className="w-full py-3 text-claw-primary font-medium hover:bg-claw-primary/10 rounded-xl transition-colors">
          Load more tokens
        </button>
      )}
    </motion.div>
  )
}
