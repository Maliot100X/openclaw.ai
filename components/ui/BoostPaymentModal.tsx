'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, AlertCircle, Crown, Rocket, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { PAYMENT_ADDRESS, BOOST_TIERS, CHAINS, getBoostTier } from '@/lib/constants'
import sdk from '@farcaster/frame-sdk'

interface BoostPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  token: {
    address: string
    name: string
    symbol: string
    chain: string
    imageUrl?: string | null
  }
  tier: number
  price?: number
  onSuccess?: () => void
}

// Helper function to convert string to hex
function stringToHex(str: string): string {
  return Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
}

type AppEnvironment = 'farcaster' | 'base' | 'web'

export default function BoostPaymentModal({
  isOpen,
  onClose,
  token,
  tier,
  price: propPrice,
  onSuccess
}: BoostPaymentModalProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'switching' | 'confirming' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [txHash, setTxHash] = useState('')
  const [environment, setEnvironment] = useState<AppEnvironment>('web')
  const [userId, setUserId] = useState<string | null>(null)
  const [fid, setFid] = useState<number | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [pfpUrl, setPfpUrl] = useState<string | null>(null)

  const isSubscription = tier <= 0
  const tierInfo = getBoostTier(tier)

  // ALWAYS use Base chain for payments (cheap gas!)
  const chainConfig = CHAINS.BASE
  const BASE_CHAIN_ID = `0x${CHAINS.BASE.id.toString(16)}`

  const finalPrice = propPrice ?? tierInfo.price

  // ETH price estimate ($3000 per ETH)
  // Gas on Base is ~$0.001-0.01, not $13!
  const ethPrice = 3000
  const paymentAmountEth = finalPrice / ethPrice
  const paymentAmountWei = '0x' + Math.ceil(paymentAmountEth * 1e18).toString(16)

  // Detect environment on mount
  useEffect(() => {
    detectEnv()
  }, [])

  const detectEnv = async () => {
    if (typeof window === 'undefined') {
      setEnvironment('web')
      return
    }

    // Check for Farcaster Mini App context
    try {
      const context = await sdk.context
      if (context?.user) {
        setEnvironment('farcaster')
        const user = context.user as any
        setFid(user.fid)
        setUserId(user.fid?.toString() || null)
        setUsername(user.username || null)
        setPfpUrl(user.pfpUrl || user.pfp?.url || null)

        // Get wallet from Farcaster
        if (user.verifiedAddresses?.ethAddresses?.[0]) {
          setWalletAddress(user.verifiedAddresses.ethAddresses[0])
        } else if (user.custodyAddress) {
          setWalletAddress(user.custodyAddress)
        }
        return
      }
    } catch (e) {
      console.log('[Boost] Not in Farcaster context')
    }

    // Check referrer for Base
    const referrer = document.referrer.toLowerCase()
    if (referrer.includes('base.org') || referrer.includes('coinbase')) {
      setEnvironment('base')
    } else {
      setEnvironment('web')
    }
  }

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('idle')
      setErrorMessage('')
      setTxHash('')
    }
  }, [isOpen])

  const getProvider = async () => {
    // Try Farcaster SDK first (for Mini App)
    if (environment === 'farcaster') {
      try {
        const provider = await sdk.wallet.ethProvider
        if (provider) {
          console.log('[Boost] Using Farcaster wallet provider')
          return provider
        }
      } catch (e) {
        console.log('[Boost] Farcaster provider not available')
      }
    }

    // Fallback to MetaMask/injected
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      console.log('[Boost] Using window.ethereum provider')
      return (window as any).ethereum
    }

    return null
  }

  const ensureBaseChain = async (provider: any): Promise<boolean> => {
    try {
      setStatus('switching')

      // Check current chain
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      console.log('[Boost] Current chain:', currentChainId)

      if (currentChainId === BASE_CHAIN_ID) {
        console.log('[Boost] Already on Base')
        return true
      }

      // Switch to Base
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASE_CHAIN_ID }],
        })
        console.log('[Boost] Switched to Base')

        // Double-check we're on Base now
        const newChainId = await provider.request({ method: 'eth_chainId' })
        if (newChainId !== BASE_CHAIN_ID) {
          throw new Error('Failed to switch to Base network')
        }

        return true
      } catch (switchError: any) {
        // Chain not added - add it
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BASE_CHAIN_ID,
              chainName: 'Base',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [CHAINS.BASE.rpc],
              blockExplorerUrls: [CHAINS.BASE.explorer],
            }],
          })

          // Check again after adding
          const newChainId = await provider.request({ method: 'eth_chainId' })
          return newChainId === BASE_CHAIN_ID
        }
        throw switchError
      }
    } catch (error) {
      console.error('[Boost] Chain switch error:', error)
      return false
    }
  }

  const handleConnectWallet = async () => {
    setStatus('connecting')
    setErrorMessage('')

    try {
      const provider = await getProvider()
      if (!provider) {
        throw new Error('No wallet found. Please use Warpcast or install MetaMask.')
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        if (!userId) {
          setUserId(accounts[0])
        }

        // Switch to Base BEFORE showing idle
        const onBase = await ensureBaseChain(provider)
        if (!onBase) {
          throw new Error('Please switch to Base network for low fees')
        }

        setStatus('idle')
      } else {
        throw new Error('No accounts returned from wallet')
      }
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message || 'Failed to connect wallet')
    }
  }

  const handlePayment = async () => {
    if (!walletAddress) {
      await handleConnectWallet()
      return
    }

    setStatus('confirming')
    setErrorMessage('')

    try {
      const provider = await getProvider()
      if (!provider) {
        throw new Error('No wallet provider available')
      }

      // CRITICAL: Ensure we're on Base BEFORE sending transaction
      const onBase = await ensureBaseChain(provider)
      if (!onBase) {
        throw new Error('Transaction requires Base network. Please switch to Base.')
      }

      // Create transaction data
      const dataString = isSubscription
        ? `subscription:${tier === 0 ? 'trial' : 'premium'}:${walletAddress}`
        : `boost:${tier}:${token.address}`
      const dataHex = '0x' + stringToHex(dataString)

      setStatus('processing')

      // Send transaction ONLY on Base
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: PAYMENT_ADDRESS,
          value: paymentAmountWei,
          data: dataHex,
        }],
      })

      setTxHash(hash)

      // Save to database with CORRECT parameter names + metadata
      if (isSubscription) {
        await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: tier === 0 ? 'trial' : 'premium',
            transactionHash: hash,
            userId: userId || walletAddress,
          }),
        }).catch(console.error)
      } else {
        // Save boost with ALL metadata so it appears instantly
        const boostResponse = await fetch('/api/boosts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId || walletAddress,
            tokenAddress: token.address,
            tokenChain: token.chain,
            tier,
            transactionHash: hash,
            // Token metadata
            tokenName: token.name,
            tokenSymbol: token.symbol,
            tokenImageUrl: token.imageUrl,
            // User metadata
            userFid: fid,
            userUsername: username,
            userPfpUrl: pfpUrl,
          }),
        })

        const boostData = await boostResponse.json()
        console.log('[Boost] API response:', boostData)

        if (!boostData.success) {
          throw new Error(boostData.error || 'Failed to save boost')
        }

        // Also save to localStorage for Holdings view
        const savedCoins = localStorage.getItem('clawai_boosted_coins')
        const coins = savedCoins ? JSON.parse(savedCoins) : []
        coins.push({
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          chain: token.chain,
          imageUrl: token.imageUrl,
          boostedAt: new Date().toISOString(),
          tier,
          txHash: hash,
        })
        localStorage.setItem('clawai_boosted_coins', JSON.stringify(coins))
      }

      setStatus('success')

      // CRITICAL: Trigger refresh via custom event so HomeTab updates INSTANTLY
      // We dispatch this globally so any component listening can update
      const event = new CustomEvent('boostCreated', {
        detail: {
          tokenAddress: token.address,
          tier,
          hash,
          timestamp: new Date().toISOString()
        }
      })
      window.dispatchEvent(event)

      // Also notify parent if needed
      if (onSuccess) {
        onSuccess()
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error: any) {
      setStatus('error')
      if (error.code === 4001) {
        setErrorMessage('Transaction cancelled')
      } else {
        setErrorMessage(error.message || 'Payment failed')
      }
    }
  }

  const getTierIcon = () => {
    if (isSubscription) return <Crown className="text-yellow-400" size={24} />
    switch (tier) {
      case 3: return <Zap className="text-yellow-400" size={24} />
      case 2: return <Crown className="text-claw-primary" size={24} />
      default: return <Rocket className="text-blue-400" size={24} />
    }
  }

  const getTierGradient = () => {
    if (isSubscription) return 'from-yellow-500/20 to-purple-500/20 border-yellow-500/30'
    switch (tier) {
      case 3: return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
      case 2: return 'from-claw-primary/20 to-purple-500/20 border-claw-primary/30'
      default: return 'from-blue-500/20 to-purple-500/20 border-blue-500/30'
    }
  }

  const getTitle = () => {
    if (isSubscription) {
      return tier === 0 ? 'Trial Subscription' : 'Premium Subscription'
    }
    return tierInfo.name
  }

  const getDescription = () => {
    if (isSubscription) {
      return tier === 0 ? '7 days of full access' : '30 days of premium features'
    }
    return tierInfo.description
  }

  const getDuration = () => {
    if (isSubscription) {
      return tier === 0 ? '7 days' : '30 days'
    }
    return `${tierInfo.duration} minutes`
  }

  const getEnvironmentLabel = () => {
    switch (environment) {
      case 'farcaster': return '🟣 Farcaster'
      case 'base': return '🔵 Base'
      default: return '🌐 Web'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-claw-dark border rounded-2xl w-full max-w-md p-6 bg-gradient-to-br ${getTierGradient()}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getTierIcon()}
              <h2 className="text-xl font-bold">{getTitle()}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Environment badge */}
          <div className="text-xs text-gray-400 mb-4">
            {getEnvironmentLabel()} • Paying on Base (gas: ~$0.01)
          </div>

          {/* Token Info */}
          {!isSubscription && (
            <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl mb-4">
              <img
                src={token.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${token.address}`}
                alt={token.name}
                className="w-12 h-12 rounded-full bg-claw-dark"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${token.address}`
                }}
              />
              <div>
                <p className="font-bold">{token.name}</p>
                <p className="text-sm text-gray-400">${token.symbol} • {token.chain.toUpperCase()}</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Duration</span>
              <span className="font-bold">{getDuration()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Feature</span>
              <span className="text-right max-w-[200px]">{getDescription()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price</span>
              <span className="text-xl font-bold text-green-400">${finalPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Network</span>
              <span className="text-blue-400">🔵 Base (gas: ~$0.01)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ETH amount</span>
              <span className="text-gray-400">~{paymentAmountEth.toFixed(6)} ETH</span>
            </div>
          </div>

          {/* Status Messages */}
          {status === 'switching' && (
            <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl mb-4 flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-500" size={20} />
              <p className="text-blue-300 text-sm">Switching to Base network...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={24} />
                <div>
                  <p className="font-bold text-green-400">
                    {isSubscription ? 'Subscribed!' : 'Boost Active!'} 🎉
                  </p>
                  <p className="text-sm text-green-300">
                    {isSubscription ? 'Enjoy your premium features!' : 'Your coin is now featured!'}
                  </p>
                </div>
              </div>
              {txHash && (
                <a
                  href={`${chainConfig.explorer}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-400 hover:underline mt-2 block"
                >
                  View on BaseScan →
                </a>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={status === 'processing' || status === 'success' || status === 'switching'}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${status === 'processing' || status === 'confirming' || status === 'switching'
              ? 'bg-gray-600 cursor-not-allowed'
              : tier === 3 || isSubscription
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                : tier === 2
                  ? 'bg-claw-primary hover:bg-claw-primary/80'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            {status === 'connecting' && (
              <><Loader2 className="animate-spin" size={20} /> Connecting Wallet...</>
            )}
            {status === 'switching' && (
              <><Loader2 className="animate-spin" size={20} /> Switching to Base...</>
            )}
            {status === 'confirming' && (
              <><Loader2 className="animate-spin" size={20} /> Confirm in wallet...</>
            )}
            {status === 'processing' && (
              <><Loader2 className="animate-spin" size={20} /> Processing on Base...</>
            )}
            {status === 'success' && (
              <><CheckCircle2 size={20} /> {isSubscription ? 'Subscribed!' : 'Boosted!'}</>
            )}
            {(status === 'idle' || status === 'error') && (
              walletAddress
                ? `Pay $${finalPrice} on Base`
                : environment === 'web' ? 'Connect MetaMask' : 'Connect Wallet'
            )}
          </button>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Payment on Base Network • Gas: ~$0.01 • ClawAI Treasury
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
