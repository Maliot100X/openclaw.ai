'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Trophy, Medal, Crown, TrendingUp, Users } from 'lucide-react'
import type { LeaderboardPeriod, LeaderboardType } from '@/types'

// Mock leaderboard data
const mockCoinLeaderboard = [
  { rank: 1, name: 'Based AI', symbol: 'BAI', chain: 'base', boostCount: 42, totalSpent: 156, image: 'https://via.placeholder.com/48/FF6B35/fff?text=1' },
  { rank: 2, name: 'Claw Token', symbol: 'CLAW', chain: 'base', boostCount: 38, totalSpent: 132, image: 'https://via.placeholder.com/48/7C3AED/fff?text=2' },
  { rank: 3, name: 'Zorb', symbol: 'ZORB', chain: 'zora', boostCount: 31, totalSpent: 98, image: 'https://via.placeholder.com/48/5B21B6/fff?text=3' },
  { rank: 4, name: 'Brett', symbol: 'BRETT', chain: 'base', boostCount: 28, totalSpent: 87, image: 'https://via.placeholder.com/48/0052FF/fff?text=4' },
  { rank: 5, name: 'Degen', symbol: 'DEGEN', chain: 'base', boostCount: 25, totalSpent: 76, image: 'https://via.placeholder.com/48/00D9FF/fff?text=5' },
]

const mockBuyerLeaderboard = [
  { rank: 1, username: 'whale.eth', fid: 123, boostsBought: 89, totalSpent: 534, pfp: 'https://via.placeholder.com/48/FF6B35/fff?text=W' },
  { rank: 2, username: 'degen_king', fid: 456, boostsBought: 67, totalSpent: 402, pfp: 'https://via.placeholder.com/48/7C3AED/fff?text=D' },
  { rank: 3, username: 'based_chad', fid: 789, boostsBought: 54, totalSpent: 324, pfp: 'https://via.placeholder.com/48/0052FF/fff?text=B' },
  { rank: 4, username: 'claw_hunter', fid: 101, boostsBought: 42, totalSpent: 252, pfp: 'https://via.placeholder.com/48/5B21B6/fff?text=C' },
  { rank: 5, username: 'zora_fan', fid: 202, boostsBought: 38, totalSpent: 228, pfp: 'https://via.placeholder.com/48/00D9FF/fff?text=Z' },
]

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy className="text-yellow-400" size={28} />
        <h1 className="text-2xl font-bold">Leaderboard</h1>
      </div>

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

      {/* Leaderboard List */}
      <div className="space-y-3">
        {activeType === 'boosted_coins' ? (
          mockCoinLeaderboard.map((item, index) => (
            <motion.div
              key={item.rank}
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
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-gray-400">${item.symbol} • {item.chain}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-claw-primary">{item.boostCount} boosts</p>
                  <p className="text-sm text-gray-400">${item.totalSpent} spent</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          mockBuyerLeaderboard.map((item, index) => (
            <motion.div
              key={item.rank}
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
                  src={item.pfp}
                  alt={item.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-bold">@{item.username}</p>
                  <p className="text-sm text-gray-400">FID: {item.fid}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-claw-primary">{item.boostsBought} boosts</p>
                  <p className="text-sm text-gray-400">${item.totalSpent} spent</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Your Rank */}
      <div className="card bg-claw-primary/10 border-claw-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Your Rank</p>
            <p className="text-2xl font-bold">#42</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Boosts</p>
            <p className="text-2xl font-bold text-claw-primary">7</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
