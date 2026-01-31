'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ExternalLink, Copy, Check, ChevronDown, ChevronUp, Droplets, DollarSign } from 'lucide-react'
import { useState } from 'react'
import type { Token } from '@/types'
import SwapModal from './SwapModal'

interface CoinCardProps {
  token: Token
  index?: number
  showBoostButton?: boolean
  showBuySell?: boolean
  showBoostPrices?: boolean
  compact?: boolean
}

export default function CoinCard({ 
  token, 
  index = 0, 
  showBoostButton = true,
  showBuySell = true,
  showBoostPrices = true,
  compact = false
}: CoinCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [swapModal, setSwapModal] = useState<{ open: boolean; mode: 'buy' | 'sell' }>({ open: false, mode: 'buy' })

  const priceChange = token.priceChange24h || 0
  const isPositive = priceChange >= 0

  const copyAddress = () => {
    navigator.clipboard.writeText(token.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatNumber = (num: number | undefined) => {
    if (!num) return '$0'
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPrice = (price: number | undefined) => {
    if (!price) return '$0.00'
    if (price < 0.000001) return `$${price.toExponential(2)}`
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  const getExplorerUrl = () => {
    const chain = token.chain?.toLowerCase()
    if (chain === 'zora') {
      return `https://explorer.zora.energy/token/${token.address}`
    }
    return `https://basescan.org/token/${token.address}`
  }

  const getImageUrl = () => {
    if (token.imageUrl && !token.imageUrl.includes('undefined')) {
      return token.imageUrl
    }
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${token.address}`
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`card-hover ${compact ? 'p-3' : 'p-4'}`}
      >
        {/* Main Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Token Image */}
            <div className="relative">
              <img
                src={getImageUrl()}
                alt={token.name}
                className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-claw-dark`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${token.address}`
                }}
              />
              {token.verified && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check size={10} />
                </div>
              )}
            </div>

            {/* Token Info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{token.name}</span>
                <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded text-gray-400">
                  {token.chain?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>${token.symbol}</span>
                <span>•</span>
                <span>{formatPrice(token.price)}</span>
              </div>
            </div>
          </div>

          {/* Price Change */}
          <div className="text-right">
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-bold">
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
            {!compact && (
              <p className="text-xs text-gray-500">24h</p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        {!compact && (
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <DollarSign size={12} />
              <span>Vol: {formatNumber(token.volume24h)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets size={12} />
              <span>Liq: {formatNumber(token.liquidity)}</span>
            </div>
            {token.fdv && token.fdv > 0 && (
              <span>FDV: {formatNumber(token.fdv)}</span>
            )}
          </div>
        )}

        {/* Buy/Sell Buttons - Always visible */}
        {showBuySell && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setSwapModal({ open: true, mode: 'buy' })}
              className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-bold transition-colors"
            >
              Buy
            </button>
            <button
              onClick={() => setSwapModal({ open: true, mode: 'sell' })}
              className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-bold transition-colors"
            >
              Sell
            </button>
            <a
              href={getExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        )}

        {/* Expandable Boost Section */}
        {showBoostPrices && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full py-2 px-3 bg-claw-primary/10 hover:bg-claw-primary/20 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-claw-primary">🦀 Boost this coin</span>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-2"
              >
                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Boost I</p>
                      <p className="text-xs text-gray-400">10 min spotlight</p>
                    </div>
                    <span className="text-lg font-bold text-green-400 group-hover:scale-110 transition-transform">$1</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-claw-primary/10 hover:bg-claw-primary/20 rounded-lg text-left transition-colors group border border-claw-primary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-claw-primary">ClawKing 👑</p>
                      <p className="text-xs text-gray-400">25 min visibility</p>
                    </div>
                    <span className="text-lg font-bold text-claw-primary group-hover:scale-110 transition-transform">$3</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-lg text-left transition-colors group border border-yellow-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-yellow-400">Jetted King 🚀</p>
                      <p className="text-xs text-gray-400">Global + notifications</p>
                    </div>
                    <span className="text-lg font-bold text-yellow-400 group-hover:scale-110 transition-transform">$6</span>
                  </div>
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Contract Address */}
        {!compact && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-xs text-gray-500 font-mono">
              {token.address?.slice(0, 6)}...{token.address?.slice(-4)}
            </span>
            <button
              onClick={copyAddress}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              {copied ? (
                <><Check size={12} className="text-green-500" /> Copied!</>
              ) : (
                <><Copy size={12} /> Copy</>
              )}
            </button>
          </div>
        )}
      </motion.div>

      {/* Swap Modal */}
      <SwapModal
        isOpen={swapModal.open}
        onClose={() => setSwapModal({ ...swapModal, open: false })}
        token={{
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          chain: token.chain,
          price: token.price || 0,
          imageUrl: token.imageUrl,
        }}
        mode={swapModal.mode}
      />
    </>
  )
}
