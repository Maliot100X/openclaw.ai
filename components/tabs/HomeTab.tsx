'use client'

import { motion } from 'framer-motion'
import { Flame, TrendingUp, Crown, Zap, Clock, Loader2, RefreshCw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import CoinCard from '@/components/ui/CoinCard'
import type { Token } from '@/types'

interface ActiveBoost {
  id: string
  tier: number
  price: number
  durationMinutes: number
  startTime: string
  endTime: string
  token: {
    id: string
    address: string
    name: string
    symbol: string
    chain: string
    imageUrl: string
  }
  user: {
    fid: number
    username: string
    pfpUrl: string
  }
}

export default function HomeTab() {
  const [boostedCoins, setBoostedCoins] = useState<ActiveBoost[]>([])
  const [trendingCoins, setTrendingCoins] = useState<Token[]>([])
  const [loadingBoosts, setLoadingBoosts] = useState(true)
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({})

  // Fetch active boosts from Supabase
  const fetchBoosts = useCallback(async () => {
    try {
      const res = await fetch('/api/boosts?limit=5')
      const data = await res.json()
      if (data.success) {
        setBoostedCoins(data.boosts || [])
      }
    } catch (err) {
      console.error('Error fetching boosts:', err)
    } finally {
      setLoadingBoosts(false)
    }
  }, [])

  // Fetch trending tokens from GeckoTerminal
  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch('/api/tokens?chain=trending')
      const data = await res.json()
      if (data.success) {
        setTrendingCoins(data.tokens || [])
      }
    } catch (err) {
      console.error('Error fetching trending:', err)
    } finally {
      setLoadingTrending(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchBoosts()
    fetchTrending()
  }, [fetchBoosts, fetchTrending])

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: { [key: string]: number } = {}
      boostedCoins.forEach((boost) => {
        const remaining = Math.max(0, new Date(boost.endTime).getTime() - Date.now())
        newTimeLeft[boost.id] = remaining
      })
      setTimeLeft(newTimeLeft)

      // Check for expired boosts and refresh
      const hasExpired = boostedCoins.some(boost => 
        new Date(boost.endTime).getTime() < Date.now()
      )
      if (hasExpired) {
        fetchBoosts()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [boostedCoins, fetchBoosts])

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

  const handleRefresh = () => {
    setLoadingBoosts(true)
    setLoadingTrending(true)
    fetchBoosts()
    fetchTrending()
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-claw-primary" size={24} />
            <h2 className="text-xl font-bold">ClawKing Spotlight</h2>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={18} className={loadingBoosts ? 'animate-spin' : ''} />
          </button>
        </div>

        {loadingBoosts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-claw-primary" />
          </div>
        ) : boostedCoins.length > 0 ? (
          <div className="space-y-3">
            {boostedCoins.map((boost, index) => (
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
                        className="w-12 h-12 rounded-full bg-claw-dark"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${boost.token.address}`
                        }}
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
                      <p className="text-gray-400 text-sm">
                        ${boost.token.symbol} • {boost.token.chain}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">by @{boost.user.username}</p>
                    <div className="flex items-center gap-1 text-sm text-claw-primary font-mono">
                      <Clock size={14} />
                      <span>{formatTime(timeLeft[boost.id] || 0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8 bg-gradient-to-r from-claw-primary/10 to-claw-secondary/10">
            <Flame size={40} className="mx-auto text-claw-primary mb-3" />
            <p className="text-gray-300 font-medium">No boosted coins right now</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to boost and get featured! 🚀</p>
          </div>
        )}
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-green-500" size={24} />
          <h2 className="text-xl font-bold">Trending</h2>
          <span className="text-xs text-gray-500 ml-2">📊 Live from GeckoTerminal</span>
        </div>

        {loadingTrending ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-green-500" />
          </div>
        ) : trendingCoins.length > 0 ? (
          <div className="space-y-3">
            {trendingCoins.slice(0, 5).map((token, index) => (
              <CoinCard 
                key={token.id || token.address} 
                token={token} 
                index={index}
                showBoostButton={true}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-400">Unable to load trending tokens</p>
            <button
              onClick={fetchTrending}
              className="mt-2 text-sm text-claw-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </section>
    </motion.div>
  )
}
