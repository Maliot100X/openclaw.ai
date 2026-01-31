'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ExternalLink, Verified } from 'lucide-react'
import type { Token } from '@/types'

interface CoinCardProps {
  token: Token
  index?: number
  showBoostButton?: boolean
  onBoost?: (token: Token) => void
}

const chainColors = {
  base: 'bg-blue-500',
  zora: 'bg-purple-500',
  ethereum: 'bg-gray-500',
}

const chainLabels = {
  base: 'Base',
  zora: 'Zora',
  ethereum: 'ETH',
}

export default function CoinCard({ token, index = 0, showBoostButton = true, onBoost }: CoinCardProps) {
  const isPositive = (token.priceChange24h || 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card-hover"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={token.imageUrl || `https://via.placeholder.com/48/1A1A2E/fff?text=${token.symbol[0]}`}
              alt={token.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${chainColors[token.chain]}`}>
              {chainLabels[token.chain]}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold">{token.name}</span>
              {token.verified && <Verified size={14} className="text-blue-400" />}
            </div>
            <p className="text-gray-400 text-sm">${token.symbol}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-mono">${token.price?.toFixed(6) || '0.00'}</p>
          <div className={`flex items-center gap-1 text-sm ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(token.priceChange24h || 0).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {showBoostButton && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onBoost?.(token)}
            className="flex-1 btn-primary text-sm py-2"
          >
            🚀 Boost this coin
          </button>
          <button className="p-2 border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
            <ExternalLink size={18} />
          </button>
        </div>
      )}
    </motion.div>
  )
}
