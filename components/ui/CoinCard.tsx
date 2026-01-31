'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, ExternalLink, Verified, BarChart3, Droplets, ShoppingCart, Banknote, Rocket, ChevronDown, ChevronUp } from 'lucide-react'
import type { Token } from '@/types'

interface CoinCardProps {
  token: Token
  index?: number
  showBoostButton?: boolean
  showBuySell?: boolean
  showBoostPrices?: boolean
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

// DEX URLs for buying
const chainDex: Record<string, { name: string; url: string }> = {
  base: { name: 'Uniswap', url: 'https://app.uniswap.org/swap?chain=base&outputCurrency=' },
  zora: { name: 'Uniswap', url: 'https://app.uniswap.org/swap?chain=zora&outputCurrency=' },
  ethereum: { name: 'Uniswap', url: 'https://app.uniswap.org/swap?outputCurrency=' },
}

// Boost tier pricing
const boostTiers = [
  { tier: 1, price: '$1', duration: '10 min', description: 'Quick boost' },
  { tier: 2, price: '$3', duration: '25 min', description: 'Extended visibility' },
  { tier: 3, price: '$6', duration: 'Global', description: '+ Push notifications' },
]

// Format large numbers (1000 -> 1K, 1000000 -> 1M)
function formatNumber(num: number | undefined): string {
  if (!num || num === 0) return '$0'
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`
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

export default function CoinCard({ 
  token, 
  index = 0, 
  showBoostButton = true, 
  showBuySell = false,
  showBoostPrices = false,
  onBoost 
}: CoinCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedBoostTier, setSelectedBoostTier] = useState<number | null>(null)
  
  const isPositive = (token.priceChange24h || 0) >= 0
  const chain = token.chain || 'base'
  const explorerUrl = `${chainExplorers[chain] || chainExplorers.base}${token.address}`
  const dexInfo = chainDex[chain] || chainDex.base
  const buyUrl = `${dexInfo.url}${token.address}`
  const sellUrl = buyUrl // Same URL, user can switch direction

  const handleBuy = () => {
    window.open(buyUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSell = () => {
    window.open(sellUrl, '_blank', 'noopener,noreferrer')
  }

  const handleExternalLink = () => {
    window.open(explorerUrl, '_blank', 'noopener,noreferrer')
  }

  const handleBoostSelect = (tier: number) => {
    setSelectedBoostTier(tier)
    // TODO: Open payment modal
    onBoost?.(token)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card-hover"
    >
      {/* Main Info Row */}
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

      {/* Volume and Liquidity */}
      {(token.volume24h || token.liquidity || token.fdv) && (
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
          {token.fdv && (
            <div className="flex items-center gap-1">
              <span>FDV: {formatNumber(token.fdv)}</span>
            </div>
          )}
        </div>
      )}

      {/* Buy/Sell Buttons */}
      {showBuySell && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleBuy}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors text-sm"
          >
            <ShoppingCart size={16} />
            Buy
          </button>
          <button
            onClick={handleSell}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors text-sm"
          >
            <Banknote size={16} />
            Sell
          </button>
          <button 
            onClick={handleExternalLink}
            className="p-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
            title="View on explorer"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      )}

      {/* Expand/Collapse for Boost Prices */}
      {showBoostPrices && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between py-2 px-3 bg-claw-dark/50 rounded-lg hover:bg-claw-dark/70 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm">
              <Rocket size={16} className="text-claw-primary" />
              <span>Boost this coin</span>
            </div>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2">
                  {boostTiers.map((tier) => (
                    <button
                      key={tier.tier}
                      onClick={() => handleBoostSelect(tier.tier)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        selectedBoostTier === tier.tier
                          ? 'border-claw-primary bg-claw-primary/20'
                          : 'border-white/10 hover:border-white/30 bg-claw-dark/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          tier.tier === 1 ? 'bg-blue-500/20 text-blue-400' :
                          tier.tier === 2 ? 'bg-purple-500/20 text-purple-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {tier.tier}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">{tier.description}</div>
                          <div className="text-xs text-gray-400">{tier.duration}</div>
                        </div>
                      </div>
                      <div className="font-bold text-claw-accent">{tier.price}</div>
                    </button>
                  ))}
                  
                  {selectedBoostTier && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full btn-primary py-3 font-bold"
                      onClick={() => onBoost?.(token)}
                    >
                      🚀 Pay & Boost Now
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Simple Boost Button (when not showing prices) */}
      {showBoostButton && !showBoostPrices && (
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
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span className="font-mono">
          {token.address.slice(0, 6)}...{token.address.slice(-4)}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(token.address)}
          className="hover:text-white transition-colors"
        >
          Copy
        </button>
      </div>
    </motion.div>
  )
}
