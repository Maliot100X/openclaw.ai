'use client'

import { motion } from 'framer-motion'
import { Flame, TrendingUp, Crown, Zap, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import CoinCard from '@/components/ui/CoinCard'
import type { Token, Boost } from '@/types'

// Mock data for demo - will be replaced with real API data
const mockBoostedCoins: (Boost & { token: Token })[] = [
  {
    id: '1',
    tokenId: 't1',
    token: {
      id: 't1',
      address: '0x1234...5678',
      name: 'Based AI',
      symbol: 'BAI',
      chain: 'base',
      imageUrl: 'https://via.placeholder.com/100/FF6B35/fff?text=BAI',
      price: 0.0042,
      priceChange24h: 15.5,
      verified: true,
    },
    userId: 'u1',
    user: { id: 'u1', fid: 123, username: 'whale', displayName: 'Whale', pfpUrl: '', wallets: [], createdAt: '', updatedAt: '' },
    tier: 3,
    price: 6,
    durationMinutes: 60,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 45 * 60000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    tokenId: 't2',
    token: {
      id: 't2',
      address: '0x2345...6789',
      name: 'Claw Token',
      symbol: 'CLAW',
      chain: 'base',
      imageUrl: 'https://via.placeholder.com/100/7C3AED/fff?text=CLAW',
      price: 0.00089,
      priceChange24h: 8.2,
      verified: true,
    },
    userId: 'u2',
    user: { id: 'u2', fid: 456, username: 'degen', displayName: 'Degen', pfpUrl: '', wallets: [], createdAt: '', updatedAt: '' },
    tier: 2,
    price: 3,
    durationMinutes: 25,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 15 * 60000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

const mockTrendingCoins: Token[] = [
  {
    id: 't3',
    address: '0x3456...789a',
    name: 'Zora Meme',
    symbol: 'ZMEME',
    chain: 'zora',
    imageUrl: 'https://via.placeholder.com/100/5B21B6/fff?text=ZMEME',
    price: 0.00012,
    priceChange24h: 42.5,
    volume24h: 125000,
    verified: true,
  },
  {
    id: 't4',
    address: '0x4567...89ab',
    name: 'Based Dog',
    symbol: 'BDOG',
    chain: 'base',
    imageUrl: 'https://via.placeholder.com/100/0052FF/fff?text=BDOG',
    price: 0.0025,
    priceChange24h: -5.2,
    volume24h: 89000,
    verified: true,
  },
  {
    id: 't5',
    address: '0x5678...9abc',
    name: 'Clanker AI',
    symbol: 'CLNK',
    chain: 'base',
    imageUrl: 'https://via.placeholder.com/100/00D9FF/fff?text=CLNK',
    price: 0.0078,
    priceChange24h: 22.1,
    volume24h: 234000,
    verified: true,
  },
]

export default function HomeTab() {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({})

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: { [key: string]: number } = {}
      mockBoostedCoins.forEach((boost) => {
        const remaining = Math.max(0, new Date(boost.endTime).getTime() - Date.now())
        newTimeLeft[boost.id] = remaining
      })
      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 3:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold">
            <Zap size={12} /> JETTED KING
          </span>
        )
      case 2:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-claw-primary rounded-full text-xs font-bold">
            <Crown size={12} /> CLAWKING
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-claw-secondary/50 rounded-full text-xs font-medium">
            <TrendingUp size={12} /> BOOSTED
          </span>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold gradient-text">🦀 ClawAI King</h1>
        <p className="text-gray-400 mt-1">Boost your coins to the top!</p>
      </div>

      {/* ClawKing Spotlight - Boosted Coins */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="text-claw-primary" size={24} />
          <h2 className="text-xl font-bold">ClawKing Spotlight</h2>
        </div>

        {mockBoostedCoins.length > 0 ? (
          <div className="space-y-3">
            {mockBoostedCoins.map((boost, index) => (
              <motion.div
                key={boost.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card-hover ${
                  boost.tier === 3 ? 'border-yellow-500/50 animate-glow' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={boost.token.imageUrl}
                        alt={boost.token.name}
                        className="w-12 h-12 rounded-full"
                      />
                      {boost.tier === 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown size={12} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{boost.token.name}</span>
                        {getTierBadge(boost.tier)}
                      </div>
                      <p className="text-gray-400 text-sm">${boost.token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg">${boost.token.price?.toFixed(6)}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Clock size={14} />
                      <span>{formatTime(timeLeft[boost.id] || 0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-400">No boosted coins right now</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to boost!</p>
          </div>
        )}
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-green-500" size={24} />
          <h2 className="text-xl font-bold">Trending</h2>
        </div>

        <div className="space-y-3">
          {mockTrendingCoins.map((token, index) => (
            <CoinCard key={token.id} token={token} index={index} />
          ))}
        </div>
      </section>
    </motion.div>
  )
}
