'use client'

import { motion } from 'framer-motion'
import { Crown, Rocket, Zap, Star, Search, Loader2, CheckCircle2, ArrowRight, Gift, Timer, Info } from 'lucide-react'
import { useState } from 'react'
import BoostPaymentModal from '@/components/ui/BoostPaymentModal'
import { BOOST_TIERS, getBoostTier } from '@/lib/constants'

interface SearchedToken {
  address: string
  name: string
  symbol: string
  chain: string
  price?: number
  imageUrl?: string | null  // Changed to match Token type
}

export default function ShopTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchedToken, setSearchedToken] = useState<SearchedToken | null>(null)
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean
    token: SearchedToken | null
    tier: number
    price: number
  }>({
    open: false,
    token: null,
    tier: 1,
    price: 1
  })

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    setSearchedToken(null)
    setSelectedTier(null)

    try {
      // Check if it's a contract address
      const isAddress = searchQuery.startsWith('0x') && searchQuery.length === 42
      
      // Try our API first
      const response = await fetch(`/api/tokens/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success && data.tokens && data.tokens.length > 0) {
        const token = data.tokens[0]
        setSearchedToken({
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          chain: token.chain || 'base',
          price: token.price,
          imageUrl: token.imageUrl || null
        })
      } else if (isAddress) {
        // If API didn't find it, still allow boosting by address
        setSearchedToken({
          address: searchQuery,
          name: 'Unknown Token',
          symbol: searchQuery.slice(0, 6).toUpperCase(),
          chain: 'base',
          price: 0,
          imageUrl: null
        })
      } else {
        setSearchedToken(null)
      }
    } catch (error) {
      console.error('Search error:', error)
      // Allow manual address input even on error
      if (searchQuery.startsWith('0x') && searchQuery.length === 42) {
        setSearchedToken({
          address: searchQuery,
          name: 'Token',
          symbol: searchQuery.slice(0, 6).toUpperCase(),
          chain: 'base',
          price: 0,
          imageUrl: null
        })
      }
    } finally {
      setSearching(false)
    }
  }

  const handleSelectTier = (tier: number) => {
    setSelectedTier(tier)
  }

  const handleProceedToPayment = () => {
    if (!searchedToken || selectedTier === null) return
    
    const tierData = getBoostTier(selectedTier)
    setPaymentModal({
      open: true,
      token: searchedToken,
      tier: selectedTier,
      price: tierData.price
    })
  }

  const getTierIcon = (tier: number) => {
    switch (tier) {
      case 3: return <Zap className="text-yellow-400" size={24} />
      case 2: return <Crown className="text-claw-primary" size={24} />
      default: return <Rocket className="text-blue-400" size={24} />
    }
  }

  const getTierGradient = (tier: number) => {
    switch (tier) {
      case 3: return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
      case 2: return 'from-claw-primary/20 to-purple-500/20 border-claw-primary/30'
      default: return 'from-blue-500/20 to-purple-500/20 border-blue-500/30'
    }
  }

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">🛒 Boost Shop</h1>
        <p className="text-gray-400">Get your token featured in ClawKing Spotlight</p>
      </div>

      {/* How it Works */}
      <div className="bg-gradient-to-r from-claw-primary/10 to-purple-500/10 rounded-xl p-4 border border-claw-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Info size={18} className="text-claw-primary" />
          <h3 className="font-semibold">How Boosting Works</h3>
        </div>
        <ol className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="bg-claw-primary/30 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
            <span>Search for your token by contract address or name</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-claw-primary/30 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
            <span>Choose a boost tier (more $ = longer visibility)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-claw-primary/30 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
            <span>Pay with ETH and your coin appears in ClawKing Spotlight instantly!</span>
          </li>
        </ol>
      </div>

      {/* Token Search */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Search size={18} />
          Find Your Token
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Paste contract address or token name"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-claw-primary/50"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-3 bg-claw-primary rounded-xl font-medium hover:bg-claw-primary/80 transition-colors disabled:opacity-50"
          >
            {searching ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
          </button>
        </div>

        {/* Search Result */}
        {searchedToken && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <img
                src={searchedToken.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${searchedToken.address}`}
                alt={searchedToken.name}
                className="w-12 h-12 rounded-full bg-claw-dark"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${searchedToken.address}`
                }}
              />
              <div className="flex-1">
                <p className="font-bold">{searchedToken.name}</p>
                <p className="text-sm text-gray-400">
                  ${searchedToken.symbol} • {searchedToken.chain.toUpperCase()}
                </p>
              </div>
              <CheckCircle2 className="text-green-500" size={24} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Boost Tiers */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Rocket size={18} className="text-claw-primary" />
          Choose Boost Tier
        </h3>
        <div className="space-y-3">
          {BOOST_TIERS.map((tier) => (
            <motion.button
              key={tier.tier}
              onClick={() => handleSelectTier(tier.tier)}
              disabled={!searchedToken}
              className={`w-full p-4 rounded-xl border transition-all text-left ${
                selectedTier === tier.tier
                  ? `bg-gradient-to-r ${getTierGradient(tier.tier)} border-2`
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              } ${!searchedToken ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={searchedToken ? { scale: 1.02 } : {}}
              whileTap={searchedToken ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  tier.tier === 3 ? 'bg-yellow-500/20' :
                  tier.tier === 2 ? 'bg-claw-primary/20' : 'bg-blue-500/20'
                }`}>
                  {getTierIcon(tier.tier)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{tier.name}</span>
                    {tier.tier === 3 && (
                      <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-400 text-xs rounded-full">BEST VALUE</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{tier.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Timer size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{tier.duration} minutes</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    tier.tier === 3 ? 'text-yellow-400' :
                    tier.tier === 2 ? 'text-claw-primary' : 'text-blue-400'
                  }`}>${tier.price}</p>
                </div>
              </div>
              {selectedTier === tier.tier && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <ul className="space-y-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 size={14} className="text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Proceed Button */}
      {searchedToken && selectedTier && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleProceedToPayment}
          className="w-full py-4 bg-gradient-to-r from-claw-primary to-purple-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          Proceed to Payment
          <ArrowRight size={20} />
        </motion.button>
      )}

      {/* Subscriptions Section */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Gift size={18} className="text-yellow-400" />
          Premium Subscriptions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Trial */}
          <motion.button
            onClick={() => setPaymentModal({
              open: true,
              token: { address: '0x0', name: 'Trial', symbol: 'TRIAL', chain: 'base', imageUrl: null },
              tier: 0,
              price: 1
            })}
            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all text-left"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-green-400" size={20} />
              <span className="font-bold">Trial</span>
            </div>
            <p className="text-2xl font-bold text-green-400">$1</p>
            <p className="text-xs text-gray-400 mt-1">7 days access</p>
          </motion.button>

          {/* Premium */}
          <motion.button
            onClick={() => setPaymentModal({
              open: true,
              token: { address: '0x0', name: 'Premium', symbol: 'PREMIUM', chain: 'base', imageUrl: null },
              tier: -1,
              price: 15
            })}
            className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30 hover:border-yellow-500/50 transition-all text-left"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="text-yellow-400" size={20} />
              <span className="font-bold">Premium</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">$15</p>
            <p className="text-xs text-gray-400 mt-1">30 days access</p>
          </motion.button>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal.token && (
        <BoostPaymentModal
          isOpen={paymentModal.open}
          onClose={() => setPaymentModal({ ...paymentModal, open: false })}
          token={{
            address: paymentModal.token.address,
            name: paymentModal.token.name,
            symbol: paymentModal.token.symbol,
            chain: paymentModal.token.chain,
            imageUrl: paymentModal.token.imageUrl || null,
          }}
          tier={paymentModal.tier}
          price={paymentModal.price}
          onSuccess={() => {
            setPaymentModal({ ...paymentModal, open: false })
            setSearchedToken(null)
            setSelectedTier(null)
            setSearchQuery('')
          }}
        />
      )}
    </div>
  )
}
