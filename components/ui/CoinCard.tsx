'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Rocket, ExternalLink, ShoppingCart, DollarSign } from 'lucide-react'
import type { Token } from '@/types'
import { useState } from 'react'
import SwapModal from './SwapModal'
import BoostPaymentModal from './BoostPaymentModal'
import { BOOST_TIERS, getBoostTier } from '@/lib/constants'

interface CoinCardProps {
  token: Token
  index?: number
  showBoostButton?: boolean
  showBuySell?: boolean
  showBoostPrices?: boolean
}

export default function CoinCard({ 
  token, 
  index = 0, 
  showBoostButton = false,
  showBuySell = false,
  showBoostPrices = false,
}: CoinCardProps) {
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapMode, setSwapMode] = useState<'buy' | 'sell'>('buy')
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState(1)
  const [showTierSelect, setShowTierSelect] = useState(false)
  
  const priceChange = token.priceChange24h || 0
  const isPositive = priceChange >= 0

  const handleBuy = () => {
    setSwapMode('buy')
    setShowSwapModal(true)
  }

  const handleSell = () => {
    setSwapMode('sell')
    setShowSwapModal(true)
  }

  const handleBoost = (tier: number = 1) => {
    setSelectedTier(tier)
    setShowBoostModal(true)
    setShowTierSelect(false)
  }

  const getExplorerUrl = () => {
    if (token.chain === 'zora') {
      return `https://explorer.zora.energy/token/${token.address}`
    }
    return `https://basescan.org/token/${token.address}`
  }

  const selectedTierData = getBoostTier(selectedTier)

  // Prepare token data for modals (handle optional fields)
  const modalToken = {
    address: token.address,
    name: token.name,
    symbol: token.symbol,
    chain: token.chain,
    price: token.price ?? 0,
    imageUrl: token.imageUrl || null,
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="card-hover"
      >
        <div className="flex items-center gap-3">
          {/* Token Image */}
          <div className="relative">
            <img
              src={token.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${token.address}`}
              alt={token.name}
              className="w-12 h-12 rounded-full bg-claw-dark"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${token.address}`
              }}
            />
            {/* Chain indicator */}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs border-2 border-claw-darker ${
              token.chain === 'zora' ? 'bg-purple-500' : 'bg-blue-500'
            }`}>
              {token.chain === 'zora' ? '🟣' : '🔵'}
            </div>
          </div>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{token.name}</span>
              <span className="text-gray-400 text-sm">${token.symbol}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono">
                ${token.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || '0.00'}
              </span>
              {priceChange !== 0 && (
                <span className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(priceChange).toFixed(2)}%
                </span>
              )}
            </div>
            {token.marketCap && (
              <p className="text-xs text-gray-500">
                MCap: ${(token.marketCap / 1000000).toFixed(2)}M
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Explorer Link */}
            <a
              href={getExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={16} className="text-gray-400" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        {(showBuySell || showBoostButton) && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex gap-2">
              {showBuySell && (
                <>
                  <button
                    onClick={handleBuy}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
                  >
                    <ShoppingCart size={16} />
                    Buy
                  </button>
                  <button
                    onClick={handleSell}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                  >
                    <DollarSign size={16} />
                    Sell
                  </button>
                </>
              )}
              {showBoostButton && (
                <div className="relative flex-1">
                  <button
                    onClick={() => setShowTierSelect(!showTierSelect)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-claw-primary/20 text-claw-primary rounded-lg hover:bg-claw-primary/30 transition-colors text-sm font-medium"
                  >
                    <Rocket size={16} />
                    Boost
                  </button>
                  
                  {/* Tier Selection Dropdown */}
                  {showTierSelect && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-claw-dark border border-white/20 rounded-xl overflow-hidden shadow-xl z-50"
                    >
                      {BOOST_TIERS.map((tier) => (
                        <button
                          key={tier.tier}
                          onClick={() => handleBoost(tier.tier)}
                          className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-0 ${
                            tier.tier === 3 ? 'bg-yellow-500/10' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{tier.name}</span>
                            <span className="text-claw-primary font-bold">${tier.price}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{tier.description}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Boost Prices Display */}
        {showBoostPrices && !showBoostButton && (
          <div className="mt-2 flex gap-2">
            {BOOST_TIERS.map((tier) => (
              <button
                key={tier.tier}
                onClick={() => handleBoost(tier.tier)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tier.tier === 1 ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                  tier.tier === 2 ? 'bg-claw-primary/20 text-claw-primary hover:bg-claw-primary/30' :
                  'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                }`}
              >
                ${tier.price} / {tier.duration}min
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Swap Modal */}
      <SwapModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        token={modalToken}
        mode={swapMode}
      />

      {/* Boost Payment Modal */}
      <BoostPaymentModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        token={modalToken}
        tier={selectedTier}
        price={selectedTierData.price}
        onSuccess={() => {
          setShowBoostModal(false)
          // Could trigger a refresh or show success toast
        }}
      />
    </>
  )
}
