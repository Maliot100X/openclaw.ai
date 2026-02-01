'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { Trophy, Medal, Crown, TrendingUp, Users, Loader2, Gift, DollarSign, Sparkles, RefreshCw } from 'lucide-react'
import sdk from '@farcaster/frame-sdk'
import type { LeaderboardPeriod, LeaderboardType } from '@/types'

interface CoinLeaderboardItem {
  rank: number
  name: string
  symbol: string
  chain: string
  image: string
  boostCount: number
  totalSpent: number
}

interface BuyerLeaderboardItem {
  rank: number
  username: string
  fid: number
  pfp: string
  boostsBought: number
  totalSpent: number
}

interface Prizes {
  first: { amount: number; currency: string; description: string }
  second: { amount: number; currency: string; description: string }
  third: { amount: number; currency: string; description: string }
}

const periods: { id: LeaderboardPeriod; label: string }[] = [
  { id: '24h', label: '24h' },
  { id: '7d', label: '7 Days' },
  { id: 'all', label: 'All Time' },
]

const types: { id: LeaderboardType; label: string; icon: typeof Trophy }[] = [
  { id: 'boosted_coins', label: 'Top Coins', icon: TrendingUp },
  { id: 'top_buyers', label: 'Top Buyers', icon: Users },
]

export default function LeaderboardTab() {
  const [activeType, setActiveType] = useState<LeaderboardType>('boosted_coins')
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>('24h')
  const [coinLeaderboard, setCoinLeaderboard] = useState<CoinLeaderboardItem[]>([])
  const [buyerLeaderboard, setBuyerLeaderboard] = useState<BuyerLeaderboardItem[]>([])
  const [prizes, setPrizes] = useState<Prizes | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // User's own data
  const [userRank, setUserRank] = useState<number | null>(null)
  const [userBoosts, setUserBoosts] = useState(0)
  const [userPoints, setUserPoints] = useState(0)
  const [userFid, setUserFid] = useState<number | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      // Load points from tasks
      const savedTasks = localStorage.getItem('clawai_tasks_v2')
      if (savedTasks) {
        const data = JSON.parse(savedTasks)
        setUserPoints(data.points || 0)
      }

      // Load boosts
      const savedBoosts = localStorage.getItem('clawai_purchased_boosts')
      if (savedBoosts) {
        const boosts = JSON.parse(savedBoosts)
        setUserBoosts(boosts.filter((b: any) => b.used).length)
      }

      // Get Farcaster user
      try {
        const context = await sdk.context
        if (context?.user) {
          const user = context.user as any
          setUserFid(user.fid)
          setUsername(user.username)
        }
      } catch {}
    }

    loadUserData()
  }, [])

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?type=${activeType}&period=${activePeriod}`)
      const data = await res.json()
      
      if (data.success) {
        if (activeType === 'boosted_coins') {
          setCoinLeaderboard(data.leaderboard || [])
        } else {
          setBuyerLeaderboard(data.leaderboard || [])
          
          // Find user's rank
          if (userFid && data.leaderboard) {
            const userEntry = data.leaderboard.find((e: BuyerLeaderboardItem) => e.fid === userFid)
            if (userEntry) {
              setUserRank(userEntry.rank)
            }
          }
        }
        setPrizes(data.prizes)
        setMessage(data.message || null)
        setLastUpdate(new Date())
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [activeType, activePeriod, userFid])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    fetchLeaderboard()
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-400" size={20} />
      case 2:
        return <Medal className="text-gray-300" size={20} />
      case 3:
        return <Medal className="text-amber-600" size={20} />
      default:
        return <span className="text-gray-400 font-mono w-5 text-center">#{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/30'
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-500/20 border-amber-600/30'
      default:
        return ''
    }
  }

  const getPrizeDisplay = (rank: number) => {
    if (!prizes) return null
    switch (rank) {
      case 1:
        return (
          <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
            <DollarSign size={12} /> {prizes.first.description}
          </span>
        )
      case 2:
        return (
          <span className="flex items-center gap-1 text-gray-300 text-xs font-bold">
            <DollarSign size={12} /> {prizes.second.description}
          </span>
        )
      case 3:
        return (
          <span className="flex items-center gap-1 text-amber-500 text-xs">
            <Gift size={12} /> {prizes.third.description}
          </span>
        )
      default:
        return null
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 space-y-4 pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-400" size={28} />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {formatTime(lastUpdate)} • Auto-refreshes every 30s
      </div>

      {/* Prize Banner */}
      {prizes && (
        <div className="card bg-gradient-to-r from-yellow-500/20 via-claw-primary/20 to-amber-500/20 border-yellow-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-yellow-400" size={20} />
            <span className="font-bold text-yellow-400">Weekly Prizes!</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="text-yellow-400 font-bold">🥇 1st</div>
              <div className="text-white">{prizes.first.description}</div>
            </div>
            <div>
              <div className="text-gray-300 font-bold">🥈 2nd</div>
              <div className="text-white">{prizes.second.description}</div>
            </div>
            <div>
              <div className="text-amber-500 font-bold">🥉 3rd</div>
              <div className="text-white">{prizes.third.description}</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Prizes sent to winner's connected wallet every Monday!
          </p>
        </div>
      )}

      {/* Type Toggle */}
      <div className="flex gap-2 bg-claw-dark/50 p-1 rounded-xl">
        {types.map((type) => {
          const Icon = type.icon
          const isActive = activeType === type.id
          return (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-claw-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              <span>{type.label}</span>
            </button>
          )
        })}
      </div>

      {/* Period Toggle */}
      <div className="flex gap-2">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => setActivePeriod(period.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activePeriod === period.id
                ? 'bg-claw-secondary text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && !isRefreshing && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-claw-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && message && (
        <div className="card text-center py-12 bg-gradient-to-r from-claw-primary/10 to-claw-secondary/10">
          <Trophy size={48} className="mx-auto text-claw-primary mb-4" />
          <p className="text-lg font-medium text-gray-300">{message}</p>
          <p className="text-sm text-gray-500 mt-2">Start boosting to climb the ranks!</p>
        </div>
      )}

      {/* Leaderboard List */}
      {!loading && !message && (
        <div className="space-y-3">
          {activeType === 'boosted_coins' ? (
            coinLeaderboard.length > 0 ? (
              coinLeaderboard.map((item, index) => (
                <motion.div
                  key={`${item.symbol}-${item.rank}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`card ${getRankBg(item.rank)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(item.rank)}
                    </div>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-full bg-claw-dark"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${item.symbol}`
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-gray-400">${item.symbol} • {item.chain}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-claw-primary">{item.boostCount} boosts</p>
                      <p className="text-sm text-gray-400">${item.totalSpent} spent</p>
                      {getPrizeDisplay(item.rank)}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : null
          ) : (
            buyerLeaderboard.length > 0 ? (
              buyerLeaderboard.map((item, index) => (
                <motion.div
                  key={`${item.fid}-${item.rank}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`card ${getRankBg(item.rank)} ${item.fid === userFid ? 'ring-2 ring-claw-primary' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(item.rank)}
                    </div>
                    <img
                      src={item.pfp}
                      alt={item.username}
                      className="w-10 h-10 rounded-full bg-claw-dark"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.fid}`
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-bold">
                        @{item.username}
                        {item.fid === userFid && <span className="text-claw-primary text-xs ml-2">(You)</span>}
                      </p>
                      <p className="text-sm text-gray-400">FID: {item.fid}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-claw-primary">{item.boostsBought} boosts</p>
                      <p className="text-sm text-gray-400">${item.totalSpent} spent</p>
                      {getPrizeDisplay(item.rank)}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : null
          )}
        </div>
      )}

      {/* Your Rank */}
      <div className="card bg-claw-primary/10 border-claw-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Your Rank</p>
            <p className="text-2xl font-bold">
              {userRank ? `#${userRank}` : username ? 'Not ranked yet' : '--'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Your Points</p>
            <p className="text-2xl font-bold text-claw-primary">{userPoints}</p>
          </div>
        </div>
        {!username && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Open in Farcaster to track your rank
          </p>
        )}
        {username && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            @{username} • {userBoosts} boosts used
          </p>
        )}
      </div>
    </motion.div>
  )
}