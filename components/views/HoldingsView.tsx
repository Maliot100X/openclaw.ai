'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Rocket, ArrowRightLeft, ExternalLink } from 'lucide-react'

interface HoldingsViewProps {
  onBack: () => void
}

// Mock holdings data
const mockHoldings = [
  {
    id: 'h1',
    name: 'Based AI',
    symbol: 'BAI',
    chain: 'base',
    balance: 125000,
    value: 525,
    priceChange: 15.5,
    image: 'https://via.placeholder.com/48/FF6B35/fff?text=BAI',
  },
  {
    id: 'h2',
    name: 'Claw Token',
    symbol: 'CLAW',
    chain: 'base',
    balance: 500000,
    value: 445,
    priceChange: 8.2,
    image: 'https://via.placeholder.com/48/7C3AED/fff?text=CLAW',
  },
  {
    id: 'h3',
    name: 'Zorb',
    symbol: 'ZORB',
    chain: 'zora',
    balance: 1000000,
    value: 89,
    priceChange: -3.1,
    image: 'https://via.placeholder.com/48/5B21B6/fff?text=ZORB',
  },
]

const mockBoostedCoins = [
  {
    id: 'bc1',
    name: 'Based AI',
    symbol: 'BAI',
    tier: 2,
    endsIn: '15 min',
    image: 'https://via.placeholder.com/48/FF6B35/fff?text=BAI',
  },
]

export default function HoldingsView({ onBack }: HoldingsViewProps) {
  const totalValue = mockHoldings.reduce((acc, h) => acc + h.value, 0)

  return (
    <div className="p-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Wallet className="text-claw-primary" size={24} />
          <h2 className="text-xl font-bold">Holdings</h2>
        </div>
      </div>

      {/* Total Value */}
      <div className="card bg-gradient-to-r from-claw-primary/20 to-claw-secondary/20 border-claw-primary/30 mb-6">
        <p className="text-sm text-gray-400">Total Portfolio Value</p>
        <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
      </div>

      {/* Boosted Coins */}
      {mockBoostedCoins.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Rocket size={18} className="text-claw-primary" />
            Boosted Coins
          </h3>
          <div className="space-y-3">
            {mockBoostedCoins.map((coin) => (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-claw-primary/30 bg-claw-primary/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{coin.name}</p>
                      <p className="text-sm text-gray-400">${coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-claw-primary rounded-full text-xs font-bold">
                      Tier {coin.tier}
                    </span>
                    <p className="text-sm text-gray-400 mt-1">Ends in {coin.endsIn}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Holdings List */}
      <div>
        <h3 className="font-semibold text-gray-300 mb-3">Your Tokens</h3>
        <div className="space-y-3">
          {mockHoldings.map((holding, index) => (
            <motion.div
              key={holding.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={holding.image}
                    alt={holding.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{holding.name}</p>
                    <p className="text-sm text-gray-400">
                      {holding.balance.toLocaleString()} ${holding.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono">${holding.value}</p>
                  <div className={`flex items-center gap-1 text-sm justify-end ${
                    holding.priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {holding.priceChange >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span>{Math.abs(holding.priceChange)}%</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-claw-primary/20 text-claw-primary rounded-lg hover:bg-claw-primary/30 transition-colors">
                  <Rocket size={16} />
                  <span>Boost</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <ArrowRightLeft size={16} />
                  <span>Swap</span>
                </button>
                <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <ExternalLink size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Refresh */}
      <button className="w-full mt-4 py-3 text-claw-primary font-medium hover:bg-claw-primary/10 rounded-xl transition-colors">
        Refresh Holdings
      </button>
    </div>
  )
}
