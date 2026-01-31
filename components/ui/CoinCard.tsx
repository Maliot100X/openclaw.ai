'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ExternalLink, Verified, BarChart3, Droplets } from 'lucide-react'
import type { Token } from '@/types'

interface CoinCardProps {
  token: Token
  index?: number
  showBoostButton?: boolean
  onBoost?: (token: Token) => void
}

const chainColors: Record<string, string> = {
  base: 'bg-blue-500',
  zora: 'bg-purple-500',
  ethereum: 'bg-gray-500',
}

const chainLabels: Record<string, string> = {
  base: 'Base',
  zora: 'Zora',
  ethereum: 'ETH',
}

const chainExplorers: Record<string, string> = {
  base: 'https://basescan.org/token/',
  zora: 'https://explorer.zora.energy/token/',
  ethereum: 'https://etherscan.io/token/',
}

// Format large numbers (1000 -> 1K, 1000000 -> 1M)
function formatNumber(num: number | undefined): string {
  if (!num || num === 0) return '$0'
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

// Format price based on value
function formatPrice(price: number | undefined): string {
  if (!price || price === 0) return '$0.00'
  if (price < 0.00001) return `$${price.toExponential(2)}`
  if (price < 0.01) return `$${price.toFixed(8)}`
  if (price < 1) return `$${price.toFixed(6)}`
  return `$${price.toFixed(4)}`
}

export default function CoinCard({ token, index = 0, showBoostButton = true, onBoost }: CoinCardProps) {
  const isPositive = (token.priceChange24h || 0) >= 0
  const chain = token.chain || 'base'
  const explorerUrl = `${chainExplorers[chain] || chainExplorers.base}${token.address}`

  const handleExternalLink = () => {
    window.open(explorerUrl, '_blank', 'noopener,noreferrer')
  }

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
              src={token.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${token.address}`}
              alt={token.name}
              className="w-12 h-12 rounded-full object-cover bg-claw-dark"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${token.address || token.symbol}`
              }}
            />
            <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${chainColors[chain] || 'bg-gray-500'}`}>
              {chainLabels[chain] || chain.toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold truncate max-w-[120px]">{token.name}</span>
              {token.verified && <Verified size={14} className="text-blue-400 flex-shrink-0" />}
            </div>
            <p className="text-gray-400 text-sm">${token.symbol}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-mono text-sm">{formatPrice(token.price)}</p>
          <div className={`flex items-center justify-end gap-1 text-sm ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(token.priceChange24h || 0).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Volume and Liquidity if available */}
      {(token.volume24h || token.liquidity) && (
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
          {token.volume24h && (
            <div className="flex items-center gap-1">
              <BarChart3 size={12} />
              <span>Vol: {formatNumber(token.volume24h)}</span>
            </div>
          )}
          {token.liquidity && (
            <div className="flex items-center gap-1">
              <Droplets size={12} />
              <span>Liq: {formatNumber(token.liquidity)}</span>
            </div>
          )}
        </div>
      )}

      {showBoostButton && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onBoost?.(token)}
            className="flex-1 btn-primary text-sm py-2"
          >
            🚀 Boost this coin
          </button>
          <button 
            onClick={handleExternalLink}
            className="p-2 border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
            title="View on explorer"
          >
            <ExternalLink size={18} />
          </button>
        </div>
      )}

      {/* Contract address (truncated) */}
      {token.address && token.address.startsWith('0x') && (
        <button
          onClick={() => navigator.clipboard.writeText(token.address)}
          className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors truncate w-full text-left"
          title="Click to copy contract address"
        >
          {token.address.slice(0, 6)}...{token.address.slice(-4)} • tap to copy
        </button>
      )}
    </motion.div>
  )
}
