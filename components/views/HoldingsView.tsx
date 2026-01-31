'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Rocket, ArrowRightLeft, ExternalLink, Loader2, AlertCircle, RefreshCw, Send, ArrowDownToLine } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import SwapModal from '@/components/ui/SwapModal'
import BoostPaymentModal from '@/components/ui/BoostPaymentModal'

interface HoldingsViewProps {
  onBack: () => void
}

interface TokenHolding {
  address: string
  name: string
  symbol: string
  chain: string
  balance: number
  value: number
  price: number
  priceChange24h: number
  imageUrl: string | null
}

interface BoostedCoin {
  id: string
  name: string
  symbol: string
  tier: number
  endsIn: string
  imageUrl: string | null
}

export default function HoldingsView({ onBack }: HoldingsViewProps) {
  const [holdings, setHoldings] = useState<TokenHolding[]>([])
  const [boostedCoins, setBoostedCoins] = useState<BoostedCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [swapModal, setSwapModal] = useState<{ open: boolean; token: any; mode: 'buy' | 'sell' }>({ 
    open: false, 
    token: null, 
    mode: 'buy' 
  })
  const [boostModal, setBoostModal] = useState<{ open: boolean; token: any }>({
    open: false,
    token: null
  })

  const totalValue = holdings.reduce((acc, h) => acc + h.value, 0)

  // Check wallet connection
  const checkWallet = useCallback(async () => {
    // Check localStorage for saved user (from Farcaster sync)
    const savedUser = localStorage.getItem('clawai_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        const address = userData.custodyAddress || userData.verifiedAddresses?.[0]
        if (address) {
          setWalletAddress(address)
          setWalletConnected(true)
          return address
        }
      } catch (e) {
        console.error('Error parsing saved user:', e)
      }
    }

    // Check MetaMask/Coinbase Wallet
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          setWalletConnected(true)
          return accounts[0]
        }
      } catch (e) {
        console.error('Error checking wallet:', e)
      }
    }

    return null
  }, [])

  // Fetch holdings from wallet
  const fetchHoldings = useCallback(async (address: string) => {
    setLoading(true)
    setError(null)

    try {
      // Fetch from our API that checks on-chain balances
      const res = await fetch(`/api/user/holdings?address=${address}`)
      const data = await res.json()

      if (data.success) {
        setHoldings(data.holdings || [])
      } else {
        setHoldings([])
      }

      // Fetch user's active boosts
      try {
        const boostsRes = await fetch(`/api/boosts?userAddress=${address}`)
        const boostsData = await boostsRes.json()
        if (boostsData.success) {
          setBoostedCoins(boostsData.userBoosts || [])
        }
      } catch (e) {
        console.log('No boosts found')
      }
    } catch (err) {
      console.error('Error fetching holdings:', err)
      setError('Failed to fetch holdings')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    const init = async () => {
      const address = await checkWallet()
      if (address) {
        await fetchHoldings(address)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [checkWallet, fetchHoldings])

  // Connect wallet
  const handleConnectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          setWalletConnected(true)
          await fetchHoldings(accounts[0])
        }
      } catch (err) {
        console.error('Wallet connection error:', err)
        setError('Failed to connect wallet')
      }
    } else {
      setError('No wallet found. Please sync your Farcaster in the Profile tab.')
    }
  }

  const handleRefresh = async () => {
    if (walletAddress) {
      await fetchHoldings(walletAddress)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getExplorerUrl = (holding: TokenHolding) => {
    if (holding.chain === 'zora') {
      return `https://explorer.zora.energy/token/${holding.address}`
    }
    return `https://basescan.org/token/${holding.address}`
  }

  // Handle Send action - opens external wallet for now
  const handleSend = (holding: TokenHolding) => {
    // For Mini App, we can't directly send - show instruction
    if (holding.symbol === 'ETH') {
      // Open in wallet
      const url = holding.chain === 'zora' 
        ? `https://explorer.zora.energy/address/${walletAddress}` 
        : `https://basescan.org/address/${walletAddress}`
      window.open(url, '_blank')
    } else {
      // For tokens, open the token page
      window.open(getExplorerUrl(holding), '_blank')
    }
  }

  return (
    <div className="p-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Wallet className="text-claw-primary" size={24} />
          <h2 className="text-xl font-bold">Holdings</h2>
        </div>
        {walletConnected && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="ml-auto p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-claw-primary' : ''} />
          </button>
        )}
      </div>

      {/* Not Connected State */}
      {!walletConnected && !loading && (
        <div className="card bg-gradient-to-r from-claw-primary/20 to-claw-secondary/20 border-claw-primary/30 text-center py-8">
          <Wallet size={48} className="mx-auto text-claw-primary mb-4" />
          <h3 className="text-lg font-bold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400 text-sm mb-4">
            Sync your Farcaster profile or connect wallet to view holdings
          </p>
          <button
            onClick={handleConnectWallet}
            className="btn-primary mx-auto"
          >
            Connect Wallet
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Or sync your Farcaster in the Profile tab for full access
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-claw-primary mb-4" />
          <p className="text-gray-400">Loading your tokens...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-500/10 border-red-500/30 flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Connected with data */}
      {walletConnected && !loading && (
        <>
          {/* Wallet Address */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <span>Connected: <span className="font-mono text-white">{formatAddress(walletAddress)}</span></span>
            <a
              href={`https://basescan.org/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-claw-primary hover:underline flex items-center gap-1"
            >
              View <ExternalLink size={12} />
            </a>
          </div>

          {/* Total Value */}
          <div className="card bg-gradient-to-r from-claw-primary/20 to-claw-secondary/20 border-claw-primary/30 mb-6">
            <p className="text-sm text-gray-400">Total Portfolio Value</p>
            <p className="text-3xl font-bold">
              {totalValue > 0 ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {holdings.length} token{holdings.length !== 1 ? 's' : ''} on Base & Zora
            </p>
          </div>

          {/* Boosted Coins */}
          {boostedCoins.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Rocket size={18} className="text-claw-primary" />
                Your Boosted Coins
              </h3>
              <div className="space-y-3">
                {boostedCoins.map((coin) => (
                  <motion.div
                    key={coin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card border-claw-primary/30 bg-claw-primary/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={coin.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${coin.symbol}`}
                          alt={coin.name}
                          className="w-10 h-10 rounded-full bg-claw-dark"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${coin.symbol}`
                          }}
                        />
                        <div>
                          <p className="font-medium">{coin.name}</p>
                          <p className="text-sm text-gray-400">${coin.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-claw-primary rounded-full text-xs font-bold">
                          Tier {coin.tier}
                        </span>
                        <p className="text-sm text-gray-400 mt-1">Ends in {coin.endsIn}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Holdings List */}
          <div>
            <h3 className="font-semibold text-gray-300 mb-3">Your Tokens</h3>
            
            {holdings.length === 0 ? (
              <div className="card text-center py-8">
                <Wallet size={32} className="mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400">No tokens found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Buy some tokens to see them here!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {holdings.map((holding, index) => (
                  <motion.div
                    key={`${holding.address}-${holding.chain}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={holding.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${holding.address}`}
                            alt={holding.name}
                            className="w-12 h-12 rounded-full bg-claw-dark"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${holding.address}`
                            }}
                          />
                          {/* Chain indicator */}
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            holding.chain === 'zora' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                            {holding.chain === 'zora' ? '🟣' : '🔵'}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{holding.name}</p>
                          <p className="text-sm text-gray-400">
                            {holding.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {holding.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium">
                          ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {holding.priceChange24h !== 0 && (
                          <div className={`flex items-center gap-1 text-sm justify-end ${
                            holding.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {holding.priceChange24h >= 0 ? (
                              <TrendingUp size={14} />
                            ) : (
                              <TrendingDown size={14} />
                            )}
                            <span>{Math.abs(holding.priceChange24h).toFixed(2)}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                      {/* Boost - only for non-ETH tokens */}
                      {holding.symbol !== 'ETH' && (
                        <button 
                          onClick={() => setBoostModal({ open: true, token: holding })}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-claw-primary/20 text-claw-primary rounded-lg hover:bg-claw-primary/30 transition-colors text-sm"
                        >
                          <Rocket size={16} />
                          <span>Boost</span>
                        </button>
                      )}
                      
                      {/* Swap */}
                      <button 
                        onClick={() => setSwapModal({ 
                          open: true, 
                          token: holding, 
                          mode: 'sell' 
                        })}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                      >
                        <ArrowRightLeft size={16} />
                        <span>Swap</span>
                      </button>
                      
                      {/* Send */}
                      <button 
                        onClick={() => handleSend(holding)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
                      >
                        <Send size={16} />
                        <span>Send</span>
                      </button>
                      
                      {/* Explorer */}
                      <a
                        href={getExplorerUrl(holding)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Swap Modal */}
      {swapModal.token && (
        <SwapModal
          isOpen={swapModal.open}
          onClose={() => setSwapModal({ ...swapModal, open: false })}
          token={{
            address: swapModal.token.address,
            name: swapModal.token.name,
            symbol: swapModal.token.symbol,
            chain: swapModal.token.chain,
            price: swapModal.token.price || 0,
            imageUrl: swapModal.token.imageUrl,
          }}
          mode={swapModal.mode}
        />
      )}

      {/* Boost Payment Modal */}
      {boostModal.token && (
        <BoostPaymentModal
          isOpen={boostModal.open}
          onClose={() => setBoostModal({ ...boostModal, open: false })}
          token={{
            address: boostModal.token.address,
            name: boostModal.token.name,
            symbol: boostModal.token.symbol,
            chain: boostModal.token.chain,
            imageUrl: boostModal.token.imageUrl,
          }}
          tier={1}
          price={1}
          onSuccess={() => {
            setBoostModal({ ...boostModal, open: false })
            handleRefresh()
          }}
        />
      )}
    </div>
  )
}
