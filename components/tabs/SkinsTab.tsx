'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Crown, Sparkles, Star, Palette, Shield,
  CheckCircle, Lock, Loader2, Coins
} from 'lucide-react'
import sdk from '@farcaster/frame-sdk'

// CORRECT payment address - ALL payments go here
const PAYMENT_ADDRESS = '0xccd1e099590bfedf279e239558772bbb50902ef6'

interface SkinsTabProps {
  onBack: () => void
}

interface Skin {
  id: string
  name: string
  description: string
  emoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  pointsCost: number
  usdPrice: number // Max $10
  category: 'badge' | 'frame' | 'effect'
  preview: string
}

export default function SkinsTab({ onBack }: SkinsTabProps) {
  const [userPoints, setUserPoints] = useState(0)
  const [ownedSkins, setOwnedSkins] = useState<string[]>(['default_crab'])
  const [equippedSkin, setEquippedSkin] = useState<string>('default_crab')
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<'all' | 'badge' | 'frame' | 'effect'>('all')
  const [paymentMethod, setPaymentMethod] = useState<'points' | 'crypto'>('points')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    checkWallet()
  }, [])

  const loadData = () => {
    const savedTasks = localStorage.getItem('clawai_tasks_v2')
    if (savedTasks) {
      const data = JSON.parse(savedTasks)
      setUserPoints(data.points || 0)
    }

    const savedSkins = localStorage.getItem('clawai_owned_skins')
    if (savedSkins) {
      setOwnedSkins(JSON.parse(savedSkins))
    }

    const savedEquipped = localStorage.getItem('clawai_equipped_skin')
    if (savedEquipped) {
      setEquippedSkin(savedEquipped)
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

  const handlePurchaseWithPoints = (skin: Skin) => {
    if (userPoints < skin.pointsCost) {
      alert('Not enough points!')
      return
    }

    setIsPurchasing(skin.id)
    
    setTimeout(() => {
      const newPoints = userPoints - skin.pointsCost
      const newOwned = [...ownedSkins, skin.id]
      
      setUserPoints(newPoints)
      setOwnedSkins(newOwned)
      
      localStorage.setItem('clawai_owned_skins', JSON.stringify(newOwned))
      
      // Update points
      const savedTasks = localStorage.getItem('clawai_tasks_v2')
      if (savedTasks) {
        const data = JSON.parse(savedTasks)
        data.points = newPoints
        localStorage.setItem('clawai_tasks_v2', JSON.stringify(data))
      }
      
      setIsPurchasing(null)
      alert(`🎉 You unlocked ${skin.name}!`)
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

  const handlePurchaseWithCrypto = async (skin: Skin) => {
    if (!walletAddress) {
      alert('Please connect your wallet first!')
      return
    }

    setIsPurchasing(skin.id)

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

      // Calculate ETH amount
      const ethPriceUsd = 3300
      const ethAmount = skin.usdPrice / ethPriceUsd
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
        const newOwned = [...ownedSkins, skin.id]
        setOwnedSkins(newOwned)
        localStorage.setItem('clawai_owned_skins', JSON.stringify(newOwned))
        alert(`🎉 You unlocked ${skin.name}!`)
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

  const handlePurchase = (skin: Skin) => {
    if (paymentMethod === 'points') {
      handlePurchaseWithPoints(skin)
    } else {
      handlePurchaseWithCrypto(skin)
    }
  }

  const handleEquip = (skinId: string) => {
    setEquippedSkin(skinId)
    localStorage.setItem('clawai_equipped_skin', skinId)
  }

  // Skins with fair pricing (max $10)
  const skins: Skin[] = [
    {
      id: 'default_crab',
      name: 'Default Crab',
      description: 'The classic ClawAI crab',
      emoji: '🦀',
      rarity: 'common',
      pointsCost: 0,
      usdPrice: 0,
      category: 'badge',
      preview: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
    },
    {
      id: 'golden_crab',
      name: 'Golden Crab',
      description: 'A shiny golden crab badge',
      emoji: '🦀',
      rarity: 'rare',
      pointsCost: 1500,
      usdPrice: 3,
      category: 'badge',
      preview: 'linear-gradient(135deg, #FFD700, #FFA500)',
    },
    {
      id: 'diamond_crab',
      name: 'Diamond Crab',
      description: 'A sparkling diamond crab',
      emoji: '💎',
      rarity: 'epic',
      pointsCost: 3000,
      usdPrice: 6,
      category: 'badge',
      preview: 'linear-gradient(135deg, #b9f2ff, #69d0ff)',
    },
    {
      id: 'king_crab',
      name: 'King Crab',
      description: 'The ultimate ClawAI King',
      emoji: '👑',
      rarity: 'legendary',
      pointsCost: 5000,
      usdPrice: 10,
      category: 'badge',
      preview: 'linear-gradient(135deg, #9333ea, #ec4899)',
    },
    {
      id: 'frame_basic',
      name: 'Basic Frame',
      description: 'Simple profile frame',
      emoji: '⭕',
      rarity: 'common',
      pointsCost: 500,
      usdPrice: 1,
      category: 'frame',
      preview: 'linear-gradient(135deg, #666, #888)',
    },
    {
      id: 'frame_fire',
      name: 'Fire Frame',
      description: 'Blazing hot profile frame',
      emoji: '🔥',
      rarity: 'rare',
      pointsCost: 2000,
      usdPrice: 4,
      category: 'frame',
      preview: 'linear-gradient(135deg, #ff4500, #ff8c00)',
    },
    {
      id: 'frame_cosmic',
      name: 'Cosmic Frame',
      description: 'Galaxy-themed frame',
      emoji: '🌌',
      rarity: 'epic',
      pointsCost: 4000,
      usdPrice: 8,
      category: 'frame',
      preview: 'linear-gradient(135deg, #1a1a4e, #4a0080, #ff00ff)',
    },
    {
      id: 'frame_rainbow',
      name: 'Rainbow Frame',
      description: 'Legendary rainbow aura',
      emoji: '🌈',
      rarity: 'legendary',
      pointsCost: 5000,
      usdPrice: 10,
      category: 'frame',
      preview: 'linear-gradient(135deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)',
    },
    {
      id: 'effect_sparkle',
      name: 'Sparkle Effect',
      description: 'Sparkles around your profile',
      emoji: '✨',
      rarity: 'rare',
      pointsCost: 1750,
      usdPrice: 3.50,
      category: 'effect',
      preview: 'linear-gradient(135deg, #ffd700, #fff)',
    },
    {
      id: 'effect_lightning',
      name: 'Lightning Effect',
      description: 'Electric lightning bolts',
      emoji: '⚡',
      rarity: 'epic',
      pointsCost: 3000,
      usdPrice: 6,
      category: 'effect',
      preview: 'linear-gradient(135deg, #00d4ff, #7b00ff)',
    },
    {
      id: 'effect_crown',
      name: 'Crown Effect',
      description: 'Floating crown animation',
      emoji: '👑',
      rarity: 'legendary',
      pointsCost: 5000,
      usdPrice: 10,
      category: 'effect',
      preview: 'linear-gradient(135deg, #ffd700, #ff6b6b)',
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-500'
      case 'rare': return 'text-blue-400 border-blue-500'
      case 'epic': return 'text-purple-400 border-purple-500'
      case 'legendary': return 'text-yellow-400 border-yellow-500'
      default: return 'text-gray-400 border-gray-500'
    }
  }

  const filteredSkins = activeCategory === 'all' 
    ? skins 
    : skins.filter(s => s.category === activeCategory)

  const equippedSkinData = skins.find(s => s.id === equippedSkin)

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
            <h1 className="text-xl font-bold">Skins Shop</h1>
            <p className="text-sm text-gray-400">Customize your profile</p>
          </div>
          <div className="bg-gradient-to-r from-claw-primary to-claw-secondary px-4 py-2 rounded-xl">
            <span className="font-bold">{userPoints}</span>
            <span className="text-sm ml-1">pts</span>
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All', icon: Palette },
            { id: 'badge', label: 'Badges', icon: Star },
            { id: 'frame', label: 'Frames', icon: Shield },
            { id: 'effect', label: 'Effects', icon: Sparkles },
          ].map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-claw-primary text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4">
        <div className="card mb-4">
          <p className="text-sm text-gray-400 mb-3">Currently Equipped</p>
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: equippedSkinData?.preview }}
            >
              {equippedSkinData?.emoji}
            </div>
            <div>
              <p className="font-bold text-lg">{equippedSkinData?.name}</p>
              <p className={`text-sm capitalize ${getRarityColor(equippedSkinData?.rarity || 'common')}`}>
                {equippedSkinData?.rarity}
              </p>
            </div>
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="wait">
            {filteredSkins.map((skin, index) => {
              const isOwned = ownedSkins.includes(skin.id)
              const isEquipped = equippedSkin === skin.id
              const canAfford = paymentMethod === 'points'
                ? userPoints >= skin.pointsCost || skin.pointsCost === 0
                : !!walletAddress || skin.usdPrice === 0
              
              return (
                <motion.div
                  key={skin.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`card p-3 relative overflow-hidden ${isEquipped ? 'ring-2 ring-claw-primary' : ''}`}
                >
                  <div 
                    className="w-full aspect-square rounded-xl flex items-center justify-center text-5xl mb-3"
                    style={{ background: skin.preview }}
                  >
                    {skin.emoji}
                  </div>

                  <p className="font-semibold text-sm truncate">{skin.name}</p>
                  <p className={`text-xs capitalize ${getRarityColor(skin.rarity)}`}>
                    {skin.rarity}
                  </p>

                  <div className="mt-2">
                    {isOwned ? (
                      <button
                        onClick={() => handleEquip(skin.id)}
                        disabled={isEquipped}
                        className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${
                          isEquipped 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-claw-primary/20 text-claw-primary hover:bg-claw-primary/30'
                        }`}
                      >
                        {isEquipped ? (
                          <span className="flex items-center justify-center gap-1">
                            <CheckCircle size={14} /> Equipped
                          </span>
                        ) : 'Equip'}
                      </button>
                    ) : skin.pointsCost === 0 ? (
                      <span className="block w-full py-2 text-center text-xs text-green-400">Free</span>
                    ) : (
                      <button
                        onClick={() => handlePurchase(skin)}
                        disabled={!canAfford || isPurchasing === skin.id}
                        className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${
                          canAfford 
                            ? 'bg-claw-primary/20 text-claw-primary hover:bg-claw-primary/30' 
                            : 'bg-gray-700 text-gray-500'
                        }`}
                      >
                        {isPurchasing === skin.id ? (
                          <Loader2 size={14} className="animate-spin mx-auto" />
                        ) : canAfford ? (
                          paymentMethod === 'points' 
                            ? `${skin.pointsCost} pts`
                            : `$${skin.usdPrice.toFixed(2)}`
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            <Lock size={12} /> 
                            {paymentMethod === 'points' ? skin.pointsCost : `$${skin.usdPrice}`}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
