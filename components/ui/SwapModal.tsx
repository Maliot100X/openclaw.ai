'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowDown, Loader2, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { PAYMENT_ADDRESS, CHAINS, USDC_ADDRESS } from '@/lib/constants'

interface SwapModalProps {
  isOpen: boolean
  onClose: () => void
  token: {
    address: string
    name: string
    symbol: string
    chain: string
    price: number
    imageUrl?: string
  }
  mode: 'buy' | 'sell'
}

export default function SwapModal({ isOpen, onClose, token, mode }: SwapModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'connecting' | 'confirming' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [walletConnected, setWalletConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')

  // Check if wallet is connected (Farcaster or MetaMask)
  useEffect(() => {
    const checkWallet = async () => {
      // Check for Farcaster Mini App context
      if (typeof window !== 'undefined') {
        // @ts-ignore - Farcaster SDK
        if (window.farcaster?.wallet) {
          setWalletConnected(true)
          // @ts-ignore
          setUserAddress(window.farcaster.wallet.address || '')
        } 
        // Check MetaMask
        else if ((window as any).ethereum) {
          try {
            const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
            if (accounts && accounts.length > 0) {
              setWalletConnected(true)
              setUserAddress(accounts[0])
            }
          } catch (e) {
            console.error('Error checking wallet:', e)
          }
        }
      }
    }
    
    if (isOpen) {
      checkWallet()
    }
  }, [isOpen])

  const chainConfig = token.chain === 'zora' ? CHAINS.ZORA : CHAINS.BASE
  
  const estimatedOutput = amount ? (
    mode === 'buy' 
      ? (parseFloat(amount) / (token.price || 0.0001)).toFixed(4)
      : (parseFloat(amount) * (token.price || 0)).toFixed(6)
  ) : '0'

  const handleConnectWallet = async () => {
    setStatus('connecting')
    setErrorMessage('')
    
    try {
      // Try Farcaster first
      // @ts-ignore
      if (window.farcaster?.wallet) {
        // @ts-ignore
        await window.farcaster.wallet.connect()
        // @ts-ignore
        setUserAddress(window.farcaster.wallet.address)
        setWalletConnected(true)
        setStatus('idle')
        return
      }
      
      // Fall back to MetaMask/injected
      if ((window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts && accounts.length > 0) {
          setUserAddress(accounts[0])
          setWalletConnected(true)
          
          // Switch to correct chain
          try {
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${chainConfig.id.toString(16)}` }],
            })
          } catch (switchError: any) {
            // Chain not added, add it
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
        }
        setStatus('idle')
      } else {
        throw new Error('No wallet found. Please use Farcaster or install MetaMask.')
      }
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message || 'Failed to connect wallet')
    }
  }

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter an amount')
      return
    }

    if (!walletConnected) {
      await handleConnectWallet()
      return
    }

    setStatus('confirming')
    setErrorMessage('')
    setLoading(true)

    try {
      // For now, open Uniswap in same context if possible, otherwise external
      const chain = token.chain === 'zora' ? 'zora' : 'base'
      const inputCurrency = mode === 'buy' ? 'ETH' : token.address
      const outputCurrency = mode === 'buy' ? token.address : 'ETH'
      
      // Build Uniswap URL with proper chain
      const chainParam = chain === 'base' ? 'base' : 'zora'
      const swapUrl = `https://app.uniswap.org/swap?chain=${chainParam}&inputCurrency=${inputCurrency}&outputCurrency=${outputCurrency}&exactAmount=${amount}&exactField=input`
      
      // Try to use Farcaster's openUrl for in-app experience
      // @ts-ignore
      if (window.farcaster?.openUrl) {
        // @ts-ignore
        window.farcaster.openUrl(swapUrl)
      } else {
        // For web, open in new tab but smaller window
        window.open(swapUrl, 'ClawSwap', 'width=420,height=700,scrollbars=yes')
      }
      
      setStatus('success')
      setTimeout(() => {
        setStatus('idle')
        setLoading(false)
      }, 2000)
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message || 'Swap failed')
      setLoading(false)
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
          className="bg-claw-dark border border-claw-primary/30 rounded-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {mode === 'buy' ? '💰 Buy' : '💸 Sell'} {token.symbol}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Token Info */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-4">
            <img
              src={token.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${token.address}`}
              alt={token.name}
              className="w-10 h-10 rounded-full bg-claw-dark"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${token.address}`
              }}
            />
            <div>
              <p className="font-bold">{token.name}</p>
              <p className="text-sm text-gray-400">
                ${token.price?.toFixed(6) || '0.00'} • {token.chain.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-3">
            <div className="bg-white/5 rounded-xl p-4">
              <label className="text-sm text-gray-400 mb-1 block">
                {mode === 'buy' ? 'You pay (ETH)' : `You sell (${token.symbol})`}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl font-bold outline-none"
              />
            </div>

            <div className="flex justify-center">
              <div className="p-2 bg-claw-primary/20 rounded-full">
                <ArrowDown size={20} className="text-claw-primary" />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <label className="text-sm text-gray-400 mb-1 block">
                {mode === 'buy' ? `You receive (${token.symbol})` : 'You receive (ETH)'}
              </label>
              <p className="text-2xl font-bold text-gray-300">
                ~{estimatedOutput}
              </p>
            </div>
          </div>

          {/* Error/Status */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <p className="text-sm text-green-300">Swap window opened! Complete your transaction.</p>
            </div>
          )}

          {/* Wallet Status */}
          {!walletConnected && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              🔒 Connect wallet to swap directly
            </p>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={loading || !amount}
            className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : mode === 'buy'
                ? 'bg-green-500 hover:bg-green-600 active:scale-98'
                : 'bg-red-500 hover:bg-red-600 active:scale-98'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {status === 'connecting' ? 'Connecting...' : 'Opening Swap...'}
              </>
            ) : walletConnected ? (
              <>
                {mode === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
              </>
            ) : (
              'Connect Wallet & Swap'
            )}
          </button>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Powered by Uniswap • {chainConfig.name} Network
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
