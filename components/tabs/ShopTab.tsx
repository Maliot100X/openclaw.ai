'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ShoppingBag, Rocket, Crown, Zap, Star, Check, Search, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { BOOST_TIERS } from '@/lib/constants'
import BoostPaymentModal from '@/components/ui/BoostPaymentModal'

type ShopSection = 'boosters' | 'subscription'

interface SearchedToken {
  address: string
  name: string
  symbol: string
  chain: string
  imageUrl: string | null
}

export default function ShopTab() {
  const [activeSection, setActiveSection] = useState<ShopSection>('boosters')
  const [searchToken, setSearchToken] = useState('')
  const [selectedToken, setSelectedToken] = useState<SearchedToken | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean
    tier: number
    price: number
    token: SearchedToken | null
  }>({
    open: false,
    tier: 1,
    price: 1,
    token: null
  })

  // Search token by address
  const handleSearchToken = async () => {
    if (!searchToken.trim()) return
    
    const isAddress = searchToken.toLowerCase().startsWith('0x') && searchToken.length === 42
    if (!isAddress) {
      setSearchError('Please enter a valid contract address (0x...)')
      return
    }

    setSearching(true)
    setSearchError(null)
    setSelectedToken(null)

    try {
      // Try Base first
      let res = await fetch(`/api/tokens/search?address=${searchToken}&chain=base`)
      let data = await res.json()
      
      if (data.success && data.token) {
        setSelectedToken({
          address: data.token.address,
          name: data.token.name,
          symbol: data.token.symbol,
          chain: data.token.chain,
          imageUrl: data.token.imageUrl
        })
      } else {
        // Try Zora
        res = await fetch(`/api/tokens/search?address=${searchToken}&chain=zora`)
        data = await res.json()
        
        if (data.success && data.token) {
          setSelectedToken({
            address: data.token.address,
            name: data.token.name,
            symbol: data.token.symbol,
            chain: data.token.chain,
            imageUrl: data.token.imageUrl
          })
        } else {
          setSearchError('Token not found on Base or Zora')
        }
      }
    } catch (err) {
      console.error('Search error:', err)
      setSearchError('Failed to search token')
    } finally {
      setSearching(false)
    }
  }

  const handleBoostPurchase = (tier: number, price: number) => {
    if (!selectedToken) return
    
    setPaymentModal({
      open: true,
      tier,
      price,
      token: selectedToken
    })
  }

  const handleSubscription = (plan: 'trial' | 'premium') => {
    // Open payment modal for subscription
    const price = plan === 'trial' ? 1 : 15
    setPaymentModal({
      open: true,
      tier: plan === 'trial' ? 0 : -1, // Special tier for subscriptions
      price,
      token: {
        address: '0x0000000000000000000000000000000000000000',
        name: plan === 'trial' ? 'Trial Subscription' : 'Premium Subscription',
        symbol: 'SUB',
        chain: 'base',
        imageUrl: null
      }
    })
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

  const getTierFeatures = (tier: number) => {
    switch (tier) {
      case 1:
        return ['Shown in Home section', '10 minutes visibility']
      case 2:
        return ['Shown in Home section', 'ClawKing badge', '25 minutes visibility']
      case 3:
        return ['TOP of Home section', 'ClawKing Jetted badge', '60 minutes visibility', 'Push notification to ALL users']
      default:
        return []
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
            <p className="text-sm text-gray-400 mb-2">Search token to boost (paste contract address):</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="0x..."
                  value={searchToken}
                  onChange={(e) => {
                    setSearchToken(e.target.value)
                    setSearchError(null)
                    if (!e.target.value) setSelectedToken(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchToken()}
                  className="w-full pl-12 pr-4 py-3 bg-claw-darker border border-white/10 rounded-xl focus:outline-none focus:border-claw-primary transition-colors"
                />
              </div>
              <button
                onClick={handleSearchToken}
                disabled={searching || !searchToken.trim()}
                className="px-4 py-3 bg-claw-primary rounded-xl font-medium hover:bg-claw-primary/80 transition-colors disabled:opacity-50"
              >
                {searching ? <Loader2 size={20} className="animate-spin" /> : 'Find'}
              </button>
            </div>
            
            {searchError && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                <AlertCircle size={16} />
                <span>{searchError}</span>
              </div>
            )}
            
            {selectedToken && (
              <div className="mt-3 p-3 bg-claw-darker rounded-xl border border-green-500/30">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedToken.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedToken.address}`}
                    alt={selectedToken.name}
                    className="w-12 h-12 rounded-full bg-claw-dark"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedToken.address}`
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{selectedToken.name}</p>
                    <p className="text-sm text-gray-400">${selectedToken.symbol} • {selectedToken.chain}</p>
                  </div>
                  <div className="text-green-400 flex items-center gap-1">
                    <Check size={18} />
                    <span className="text-sm">Ready</span>
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
                      {getTierFeatures(tier.tier).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check size={14} className="text-green-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleBoostPurchase(tier.tier, tier.price)}
                      disabled={!selectedToken}
                      className={`mt-4 w-full py-3 rounded-xl font-semibold transition-all ${
                        selectedToken
                          ? `bg-gradient-to-r ${getTierGradient(tier.tier)} text-white hover:opacity-90`
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {selectedToken ? `Boost for $${tier.price}` : 'Search token first'}
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
              Start Trial - $1
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
              Subscribe Now - $15/mo
            </button>
          </motion.div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal.token && (
        <BoostPaymentModal
          isOpen={paymentModal.open}
          onClose={() => setPaymentModal({ ...paymentModal, open: false })}
          token={paymentModal.token}
          tier={paymentModal.tier}
          price={paymentModal.price}
          onSuccess={() => {
            // Boost successful - could redirect or show success
            setPaymentModal({ ...paymentModal, open: false })
            setSelectedToken(null)
            setSearchToken('')
          }}
        />
      )}
    </motion.div>
  )
}
