'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ShoppingBag, Rocket, Crown, Zap, Star, Check, Search, Sparkles } from 'lucide-react'
import { BOOST_TIERS } from '@/types'

type ShopSection = 'boosters' | 'subscription'

export default function ShopTab() {
  const [activeSection, setActiveSection] = useState<ShopSection>('boosters')
  const [searchToken, setSearchToken] = useState('')
  const [selectedTier, setSelectedTier] = useState<number | null>(null)

  const handleBoostPurchase = (tier: number) => {
    setSelectedTier(tier)
    // TODO: Implement boost purchase flow
    alert(`Selected Booster ${tier}! Token search: ${searchToken}\n\nPayment integration coming in Phase 2`)
  }

  const handleSubscription = (plan: 'trial' | 'premium') => {
    // TODO: Implement subscription flow
    alert(`Selected ${plan} subscription!\n\nPayment integration coming in Phase 2`)
  }

  const getTierIcon = (tier: number) => {
    switch (tier) {
      case 1:
        return <Rocket size={24} />
      case 2:
        return <Crown size={24} />
      case 3:
        return <Zap size={24} />
      default:
        return <Rocket size={24} />
    }
  }

  const getTierGradient = (tier: number) => {
    switch (tier) {
      case 1:
        return 'from-blue-500 to-purple-500'
      case 2:
        return 'from-claw-primary to-orange-500'
      case 3:
        return 'from-yellow-400 to-claw-primary'
      default:
        return 'from-gray-500 to-gray-600'
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
        <ShoppingBag className="text-claw-primary" size={28} />
        <h1 className="text-2xl font-bold">Shop</h1>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-2 bg-claw-dark/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveSection('boosters')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
            activeSection === 'boosters'
              ? 'bg-claw-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Rocket size={18} />
          <span>Boosters</span>
        </button>
        <button
          onClick={() => setActiveSection('subscription')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
            activeSection === 'subscription'
              ? 'bg-claw-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Star size={18} />
          <span>Premium</span>
        </button>
      </div>

      {activeSection === 'boosters' ? (
        <>
          {/* Token Search */}
          <div className="card">
            <p className="text-sm text-gray-400 mb-2">Search token to boost:</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Enter token address or name..."
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-claw-darker border border-white/10 rounded-xl focus:outline-none focus:border-claw-primary transition-colors"
              />
            </div>
            {searchToken && (
              <div className="mt-3 p-3 bg-claw-darker rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-claw-primary/30 flex items-center justify-center">
                    <Sparkles size={20} className="text-claw-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{searchToken}</p>
                    <p className="text-sm text-green-400">✓ Token verified</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booster Tiers */}
          <div className="space-y-4">
            {BOOST_TIERS.map((tier, index) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card overflow-hidden ${
                  tier.tier === 3 ? 'ring-2 ring-yellow-500/50' : ''
                }`}
              >
                {tier.tier === 3 && (
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-center py-1 text-sm font-bold -mx-4 -mt-4 mb-4">
                    🔥 MOST POPULAR
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getTierGradient(tier.tier)} flex items-center justify-center text-white`}>
                    {getTierIcon(tier.tier)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{tier.name}</h3>
                      <span className="text-2xl font-bold text-claw-primary">${tier.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{tier.description}</p>
                    <ul className="mt-3 space-y-1">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check size={14} className="text-green-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleBoostPurchase(tier.tier)}
                      disabled={!searchToken}
                      className={`mt-4 w-full py-3 rounded-xl font-semibold transition-all ${
                        searchToken
                          ? `bg-gradient-to-r ${getTierGradient(tier.tier)} text-white hover:opacity-90`
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {searchToken ? `Boost for $${tier.price}` : 'Search token first'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        /* Subscription Section */
        <div className="space-y-4">
          {/* Trial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Trial</h3>
                <p className="text-gray-400 text-sm">7 days access</p>
              </div>
              <span className="text-2xl font-bold text-claw-primary">$1</span>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-400" />
                <span>Full feature access</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-400" />
                <span>AI bot unlimited usage</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-400" />
                <span>10% boost discount</span>
              </li>
            </ul>
            <button
              onClick={() => handleSubscription('trial')}
              className="w-full btn-outline"
            >
              Start Trial
            </button>
          </motion.div>

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card ring-2 ring-claw-secondary/50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-claw-secondary to-claw-primary text-center py-1 text-sm font-bold -mx-4 -mt-4 mb-4">
              ⭐ BEST VALUE
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Premium</h3>
                <p className="text-gray-400 text-sm">Monthly subscription</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-claw-primary">$15</span>
                <p className="text-xs text-gray-400">/month</p>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-400" />
                <span>Everything in Trial</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-400" />
                <span>20% boost discount</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-400" />
                <span>Priority ClawKing placement</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-400" />
                <span>Exclusive profile badge</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-400" />
                <span>Early access to new features</span>
              </li>
            </ul>
            <button
              onClick={() => handleSubscription('premium')}
              className="w-full btn-primary"
            >
              Subscribe Now
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
