'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Gift, Sparkles, Zap, Crown, Star, 
  ShoppingCart, CheckCircle, Loader2, TrendingUp, Coins,
  Search, Package
} from 'lucide-react'
import sdk from '@farcaster/frame-sdk'

// CORRECT payment address - ALL payments go here
const PAYMENT_ADDRESS = '0xccd1e099590bfedf279e239558772bbb50902ef6'

interface PointsTabProps {
  onBack: () => void
}

interface RewardItem {
  id: string
  type: 'boost' | 'skin' | 'special'
  name: string
  description: string
  pointsCost: number
  usdPrice?: number // In USD, payable via ETH/USDC
  icon: typeof Gift
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  available: boolean
  boostDuration?: number // Minutes
}

interface PurchasedBoost {
  id: string
  itemId: string
  purchasedAt: number
  used: boolean
  appliedToCoin?: string
}

export default function PointsTab({ onBack }: PointsTabProps) {
  const [userPoints, setUserPoints] = useState(0)
  const [purchasedItems, setPurchasedItems] = useState<string[]>([])
  const [purchasedBoosts, setPurchasedBoosts] = useState<PurchasedBoost[]>([])
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'boost' | 'skin' | 'special'>('all')
  const [paymentMethod, setPaymentMethod] = useState<'points' | 'crypto'>('points')
  const [showInventory, setShowInventory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    checkWallet()
  }, [])

  const loadData = () => {
    // Load points from tasks
    const savedTasks = localStorage.getItem('clawai_tasks_v2')
    if (savedTasks) {
      const data = JSON.parse(savedTasks)
      setUserPoints(data.points || 0)
    }

    // Load purchased items
    const savedPurchases = localStorage.getItem('clawai_purchased_items')
    if (savedPurchases) {
      setPurchasedItems(JSON.parse(savedPurchases))
    }

    // Load purchased boosts
    const savedBoosts = localStorage.getItem('clawai_purchased_boosts')
    if (savedBoosts) {
      setPurchasedBoosts(JSON.parse(savedBoosts))
    }
  }

  const checkWallet = async () => {
    try {
      const context = await sdk.context
      if (context?.user) {
        const user = context.user as any
        if (user.verifiedAddresses?.ethAddresses?.[0]) {
          setWalletAddress(user.verifiedAddresses.ethAddresses[0])
        } else if (user.custodyAddress) {
          setWalletAddress(user.custodyAddress)
        }
      }
    } catch (e) {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          if (accounts?.[0]) setWalletAddress(accounts[0])
        } catch {}
      }
    }
  }

  const handlePurchaseWithPoints = (item: RewardItem) => {
    if (userPoints < item.pointsCost) {
      alert('Not enough points! Complete more tasks to earn points.')
      return
    }

    setIsPurchasing(item.id)
    
    setTimeout(() => {
      const newPoints = userPoints - item.pointsCost
      
      // For boosts, add to inventory
      if (item.type === 'boost') {
        const newBoost: PurchasedBoost = {
          id: `boost_${Date.now()}`,
          itemId: item.id,
          purchasedAt: Date.now(),
          used: false,
        }
        const newBoosts = [...purchasedBoosts, newBoost]
        setPurchasedBoosts(newBoosts)
        localStorage.setItem('clawai_purchased_boosts', JSON.stringify(newBoosts))
      } else {
        const newPurchases = [...purchasedItems, item.id]
        setPurchasedItems(newPurchases)
        localStorage.setItem('clawai_purchased_items', JSON.stringify(newPurchases))
      }
      
      setUserPoints(newPoints)
      
      // Update points in tasks storage
      const savedTasks = localStorage.getItem('clawai_tasks_v2')
      if (savedTasks) {
        const data = JSON.parse(savedTasks)
        data.points = newPoints
        localStorage.setItem('clawai_tasks_v2', JSON.stringify(data))
      }
      
      setIsPurchasing(null)
      alert(`🎉 You got ${item.name}! ${item.type === 'boost' ? 'Check your inventory to use it.' : ''}`)
    }, 1500)
  }

  // Switch to Base chain before any transaction
  const ensureBaseChain = async (provider: any): Promise<boolean> => {
    try {
      // First check current chain
      const chainId = await provider.request({ method: 'eth_chainId' })
      if (chainId === '0x2105') return true // Already on Base

      // Try to switch
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }],
        })
        return true
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          })
          return true
        }
        throw switchError
      }
    } catch (e) {
      console.error('Failed to switch to Base:', e)
      return false
    }
  }

  const handlePurchaseWithCrypto = async (item: RewardItem) => {
    if (!item.usdPrice) return
    if (!walletAddress) {
      alert('Please connect your wallet first!')
      return
    }

    setIsPurchasing(item.id)

    try {
      let provider: any = null
      
      // Try Farcaster wallet first (for Mini App)
      try {
        provider = await sdk.wallet.ethProvider
      } catch {}
      
      // Fallback to window.ethereum
      if (!provider && typeof window !== 'undefined') {
        provider = (window as any).ethereum
      }

      if (!provider) {
        alert('No wallet provider found!')
        setIsPurchasing(null)
        return
      }

      // CRITICAL: Ensure we're on Base chain BEFORE transaction
      const onBase = await ensureBaseChain(provider)
      if (!onBase) {
        alert('Please switch to Base network to continue')
        setIsPurchasing(null)
        return
      }

      // Calculate ETH amount (approximate - $1 = ~0.0003 ETH at ~$3300/ETH)
      const ethPriceUsd = 3300
      const ethAmount = item.usdPrice / ethPriceUsd
      const weiAmount = Math.floor(ethAmount * 1e18)
      const weiHex = '0x' + weiAmount.toString(16)

      // Send to CORRECT payment address on BASE
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: PAYMENT_ADDRESS,
          value: weiHex,
        }],
      })

      if (txHash) {
        // Record purchase
        if (item.type === 'boost') {
          const newBoost: PurchasedBoost = {
            id: `boost_${Date.now()}`,
            itemId: item.id,
            purchasedAt: Date.now(),
            used: false,
          }
          const newBoosts = [...purchasedBoosts, newBoost]
          setPurchasedBoosts(newBoosts)
          localStorage.setItem('clawai_purchased_boosts', JSON.stringify(newBoosts))
        } else {
          const newPurchases = [...purchasedItems, item.id]
          setPurchasedItems(newPurchases)
          localStorage.setItem('clawai_purchased_items', JSON.stringify(newPurchases))
        }
        
        alert(`🎉 Purchase successful! You got ${item.name}!`)
      }
    } catch (error: any) {
      console.error('Purchase failed:', error)
      if (error.code === 4001) {
        alert('Transaction rejected')
      } else {
        alert('Purchase failed. Please try again.')
      }
    } finally {
      setIsPurchasing(null)
    }
  }

  const handlePurchase = (item: RewardItem) => {
    if (paymentMethod === 'points') {
      handlePurchaseWithPoints(item)
    } else {
      handlePurchaseWithCrypto(item)
    }
  }

  // Rewards with harder-to-earn points requirements
  const rewards: RewardItem[] = [
    // BOOSTS - require significant effort
    {
      id: 'boost_tier1',
      type: 'boost',
      name: 'Tier 1 Booster',
      description: '10 minute boost for any coin',
      pointsCost: 500,
      usdPrice: 1,
      icon: Zap,
      rarity: 'common',
      available: true,
      boostDuration: 10,
    },
    {
      id: 'boost_tier2',
      type: 'boost',
      name: 'Tier 2 Booster',
      description: '25 minute boost for any coin',
      pointsCost: 1200,
      usdPrice: 2.50,
      icon: Zap,
      rarity: 'rare',
      available: true,
      boostDuration: 25,
    },
    {
      id: 'boost_tier3',
      type: 'boost',
      name: 'Tier 3 Booster',
      description: '60 minute boost for any coin',
      pointsCost: 2500,
      usdPrice: 5,
      icon: Zap,
      rarity: 'epic',
      available: true,
      boostDuration: 60,
    },
    // SKINS
    {
      id: 'skin_golden_crab',
      type: 'skin',
      name: 'Golden Crab',
      description: 'Exclusive golden profile badge',
      pointsCost: 1500,
      usdPrice: 3,
      icon: Crown,
      rarity: 'rare',
      available: true,
    },
    {
      id: 'skin_diamond_claw',
      type: 'skin',
      name: 'Diamond Claw',
      description: 'Sparkling diamond profile frame',
      pointsCost: 3000,
      usdPrice: 6,
      icon: Sparkles,
      rarity: 'epic',
      available: true,
    },
    {
      id: 'skin_king_crown',
      type: 'skin',
      name: 'King Crown',
      description: 'The ultimate ClawAI King crown',
      pointsCost: 6000,
      usdPrice: 10,
      icon: Crown,
      rarity: 'legendary',
      available: true,
    },
    // SPECIAL
    {
      id: 'special_early_access',
      type: 'special',
      name: 'Early Access Pass',
      description: 'Get early access to new features',
      pointsCost: 4000,
      usdPrice: 8,
      icon: Star,
      rarity: 'legendary',
      available: true,
    },
    {
      id: 'special_boost_discount',
      type: 'special',
      name: '20% Boost Discount',
      description: 'Permanent 20% off all boosts',
      pointsCost: 8000,
      usdPrice: 10,
      icon: TrendingUp,
      rarity: 'legendary',
      available: true,
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-500/20'
      case 'rare': return 'text-blue-400 bg-blue-500/20'
      case 'epic': return 'text-purple-400 bg-purple-500/20'
      case 'legendary': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const filteredRewards = activeFilter === 'all' 
    ? rewards 
    : rewards.filter(r => r.type === activeFilter)

  const unusedBoosts = purchasedBoosts.filter(b => !b.used)

  // Inventory View
  if (showInventory) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-claw-darker pb-24"
      >
        <div className="sticky top-0 z-10 bg-claw-darker/95 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4 p-4">
            <button onClick={() => setShowInventory(false)} className="p-2 rounded-full hover:bg-white/10">
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">My Inventory</h1>
              <p className="text-sm text-gray-400">{unusedBoosts.length} unused boosts</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Search for coins to boost */}
          <div className="card mb-4">
            <p className="text-sm text-gray-400 mb-2">Search coin to boost</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter coin name or address..."
                  className="w-full pl-10 pr-3 py-2 bg-claw-darker rounded-lg text-sm border border-white/10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {unusedBoosts.length === 0 ? (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No boosters in inventory</p>
                <p className="text-gray-500 text-sm mt-2">Purchase boosters from the shop!</p>
              </div>
            ) : (
              unusedBoosts.map((boost) => {
                const item = rewards.find(r => r.id === boost.itemId)
                if (!item) return null
                const Icon = item.icon
                return (
                  <div key={boost.id} className="card">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getRarityColor(item.rarity)}`}>
                        <Icon size={28} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-400">{item.boostDuration} min boost</p>
                        <p className="text-xs text-gray-500">
                          Purchased {new Date(boost.purchasedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!searchQuery) {
                            alert('Enter a coin name or address to boost!')
                            return
                          }
                          // Apply boost to coin
                          const updatedBoosts = purchasedBoosts.map(b => 
                            b.id === boost.id ? { ...b, used: true, appliedToCoin: searchQuery } : b
                          )
                          setPurchasedBoosts(updatedBoosts)
                          localStorage.setItem('clawai_purchased_boosts', JSON.stringify(updatedBoosts))
                          
                          // Save to boosted coins for display
                          const boostedCoins = JSON.parse(localStorage.getItem('clawai_boosted_coins') || '[]')
                          boostedCoins.push({
                            coin: searchQuery,
                            boostId: boost.id,
                            tier: item.id,
                            duration: item.boostDuration,
                            appliedAt: Date.now(),
                            expiresAt: Date.now() + (item.boostDuration || 10) * 60 * 1000
                          })
                          localStorage.setItem('clawai_boosted_coins', JSON.stringify(boostedCoins))
                          
                          alert(`🚀 Boost applied to ${searchQuery}!`)
                          setSearchQuery('')
                        }}
                        className="px-4 py-2 bg-claw-primary rounded-lg text-sm font-medium"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-claw-darker pb-24"
    >
      <div className="sticky top-0 z-10 bg-claw-darker/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Points Shop</h1>
            <p className="text-sm text-gray-400">Redeem your earned points</p>
          </div>
          <div className="bg-gradient-to-r from-claw-primary to-claw-secondary px-4 py-2 rounded-xl">
            <span className="font-bold">{userPoints}</span>
            <span className="text-sm ml-1">pts</span>
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'boost', label: 'Boosts' },
            { id: 'skin', label: 'Skins' },
            { id: 'special', label: 'Special' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeFilter === filter.id 
                  ? 'bg-claw-primary text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Inventory Button */}
        <button
          onClick={() => setShowInventory(true)}
          className="w-full card mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
        >
          <div className="flex items-center gap-3">
            <Package size={24} className="text-blue-400" />
            <div className="flex-1 text-left">
              <p className="font-semibold">My Inventory</p>
              <p className="text-sm text-gray-400">{unusedBoosts.length} unused boosters</p>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </button>

        {/* Payment Method Toggle */}
        <div className="card mb-4">
          <p className="text-sm text-gray-400 mb-3">Payment Method</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod('points')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === 'points'
                  ? 'bg-claw-primary text-white'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              <Sparkles size={16} className="inline mr-2" />
              Points
            </button>
            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === 'crypto'
                  ? 'bg-claw-primary text-white'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              <Coins size={16} className="inline mr-2" />
              ETH (Base)
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <AnimatePresence mode="wait">
            {filteredRewards.map((item, index) => {
              const Icon = item.icon
              const isPurchased = purchasedItems.includes(item.id)
              const canAfford = paymentMethod === 'points' 
                ? userPoints >= item.pointsCost 
                : !!walletAddress
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`card ${isPurchased && item.type !== 'boost' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getRarityColor(item.rarity)}`}>
                      <Icon size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{item.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${canAfford ? 'text-claw-primary' : 'text-gray-500'}`}>
                        {paymentMethod === 'points' 
                          ? `${item.pointsCost} pts`
                          : `$${item.usdPrice?.toFixed(2)}`
                        }
                      </p>
                      {isPurchased && item.type !== 'boost' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-500">
                          <CheckCircle size={12} /> Owned
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={!canAfford || isPurchasing === item.id}
                          className={`mt-1 px-3 py-1 text-xs rounded-lg transition-colors ${
                            canAfford 
                              ? 'bg-claw-primary/20 text-claw-primary hover:bg-claw-primary/30' 
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isPurchasing === item.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <span className="flex items-center gap-1">
                              <ShoppingCart size={12} /> 
                              {item.type === 'boost' ? 'Buy' : 'Get'}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div className="mt-6 card bg-white/5">
          <h3 className="font-semibold mb-3">💰 Earning Points</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Follow tasks = 100 points</p>
            <p>• Daily cast/tweet = 150 points</p>
            <p>• Share score = 200 points</p>
            <p>• Tag friends = 250 points</p>
            <p>• Base verification = 300 points</p>
            <p>• Boost purchase = 500 points</p>
            <p className="text-yellow-400 mt-3">Tasks refresh every 12 hours!</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
