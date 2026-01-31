'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, AlertCircle, Crown, Rocket, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { PAYMENT_ADDRESS, BOOST_TIERS, CHAINS, getBoostTier } from '@/lib/constants'

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
  price?: number // Optional - will use tier price if not provided
  onSuccess?: () => void // Optional callback on successful payment
}

// Helper function to convert string to hex (browser compatible)
function stringToHex(str: string): string {
  return Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
}

export default function BoostPaymentModal({ 
  isOpen, 
  onClose, 
  token, 
  tier, 
  price: propPrice,
  onSuccess 
}: BoostPaymentModalProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'confirming' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [walletConnected, setWalletConnected] = useState(false)
  const [txHash, setTxHash] = useState('')

  // Handle tier as number (1, 2, 3) or special values (0 = trial sub, -1 = premium sub)
  const isSubscription = tier <= 0
  const tierInfo = getBoostTier(tier)
  const chainConfig = token.chain === 'zora' ? CHAINS.ZORA : CHAINS.BASE

  // Use prop price if provided, otherwise use tier price
  const finalPrice = propPrice ?? tierInfo.price

  // ETH price for payment (approximately $1 = 0.0003 ETH at $3000/ETH)
  const ethPrice = 3000 // TODO: Fetch real ETH price
  const paymentAmountEth = finalPrice / ethPrice
  const paymentAmountWei = Math.ceil(paymentAmountEth * 1e18)

  // Check wallet on mount
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          if (accounts && accounts.length > 0) {
            setWalletConnected(true)
          }
        } catch (e) {
          console.error('Wallet check error:', e)
        }
      }
    }
    if (isOpen) {
      checkWallet()
      setStatus('idle')
      setErrorMessage('')
      setTxHash('')
    }
  }, [isOpen])

  const handleConnectWallet = async () => {
    setStatus('connecting')
    setErrorMessage('')

    try {
      if (!(window as any).ethereum) {
        throw new Error('No wallet found. Please install MetaMask or use Farcaster.')
      }

      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts && accounts.length > 0) {
        setWalletConnected(true)
        
        // Switch to correct chain
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainConfig.id.toString(16)}` }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${chainConfig.id.toString(16)}`,
                chainName: chainConfig.name,
                rpcUrls: [chainConfig.rpc],
                nativeCurrency: chainConfig.nativeCurrency,
                blockExplorerUrls: [chainConfig.explorer],
              }],
            })
          }
        }
        setStatus('idle')
      }
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message || 'Failed to connect wallet')
    }
  }

  const handlePayment = async () => {
    if (!walletConnected) {
      await handleConnectWallet()
      return
    }

    setStatus('confirming')
    setErrorMessage('')

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
      const fromAddress = accounts[0]

      // Create transaction data - convert string to hex without Buffer
      const dataString = isSubscription 
        ? `subscription:${tier === 0 ? 'trial' : 'premium'}:${fromAddress}`
        : `boost:${tier}:${token.address}`
      const dataHex = '0x' + stringToHex(dataString)

      // Create transaction
      const txParams = {
        from: fromAddress,
        to: PAYMENT_ADDRESS,
        value: '0x' + paymentAmountWei.toString(16),
        data: dataHex,
      }

      setStatus('processing')

      // Send transaction
      const hash = await (window as any).ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      })

      setTxHash(hash)

      // Save boost or subscription to Supabase
      if (isSubscription) {
        await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: tier === 0 ? 'trial' : 'premium',
            txHash: hash,
            userAddress: fromAddress,
          }),
        }).catch(console.error)
      } else {
        await fetch('/api/boosts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenAddress: token.address,
            tokenName: token.name,
            tokenSymbol: token.symbol,
            chain: token.chain,
            tier,
            txHash: hash,
            userAddress: fromAddress,
          }),
        })
      }

      setStatus('success')

      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      } else {
        // Auto close and refresh after success
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 3000)
      }

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
          <div className="flex items-center justify-between mb-6">
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

          {/* Token Info - only for boosts */}
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
              <span className="text-gray-500">Payment</span>
              <span className="text-gray-400">~{paymentAmountEth.toFixed(6)} ETH</span>
            </div>
          </div>

          {/* Status Messages */}
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
                  View transaction →
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
            disabled={status === 'processing' || status === 'success'}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              status === 'processing' || status === 'confirming'
                ? 'bg-gray-600 cursor-not-allowed'
                : tier === 3 || isSubscription
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                : tier === 2
                ? 'bg-claw-primary hover:bg-claw-primary/80'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {status === 'connecting' && (
              <><Loader2 className="animate-spin" size={20} /> Connecting...</>
            )}
            {status === 'confirming' && (
              <><Loader2 className="animate-spin" size={20} /> Confirm in wallet...</>
            )}
            {status === 'processing' && (
              <><Loader2 className="animate-spin" size={20} /> Processing...</>
            )}
            {status === 'success' && (
              <><CheckCircle2 size={20} /> {isSubscription ? 'Subscribed!' : 'Boosted!'}</>
            )}
            {(status === 'idle' || status === 'error') && (
              walletConnected 
                ? `Pay $${finalPrice} ${isSubscription ? '' : '& Boost'}` 
                : 'Connect Wallet'
            )}
          </button>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Payment goes to ClawAI treasury • {chainConfig.name} Network
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
