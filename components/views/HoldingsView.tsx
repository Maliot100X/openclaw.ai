'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Rocket, ArrowRightLeft, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import SwapModal from '@/components/ui/SwapModal'

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

  const totalValue = holdings.reduce((acc, h) => acc + h.value, 0)

  // Check wallet connection
  const checkWallet = useCallback(async () => {
    // Check localStorage for saved user
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

    // Check MetaMask
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          setWalletConnected(true)
          return accounts[0]
        }
      } catch (e) {
        console.error('Error checking MetaMask:', e)
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
        // No holdings found - that's okay, show empty state
        setHoldings([])
      }

      // Fetch user's active boosts
      const boostsRes = await fetch(`/api/boosts?userAddress=${address}`)
      const boostsData = await boostsRes.json()
      if (boostsData.success) {
        setBoostedCoins(boostsData.userBoosts || [])
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
      // No wallet - show message
      setError('No wallet found. Please connect via Profile tab.')
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
            className="ml-auto p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Not Connected State */}
      {!walletConnected && !loading && (
        <div className="card bg-gradient-to-r from-claw-primary/20 to-claw-secondary/20 border-claw-primary/30 text-center py-8">
          <Wallet size={48} className="mx-auto text-claw-primary mb-4" />
          <h3 className="text-lg font-bold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400 text-sm mb-4">
            Connect your wallet to view your token holdings
          </p>
          <button
            onClick={handleConnectWallet}
            className="btn-primary mx-auto"
          >
            Connect Wallet
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Or sync your Farcaster in the Profile tab
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-claw-primary mb-4" />
          <p className="text-gray-400">Loading holdings...</p>
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
          <div className="text-sm text-gray-400 mb-4">
            Connected: <span className="font-mono text-white">{formatAddress(walletAddress)}</span>
          </div>

          {/* Total Value */}
          <div className="card bg-gradient-to-r from-claw-primary/20 to-claw-secondary/20 border-claw-primary/30 mb-6">
            <p className="text-sm text-gray-400">Total Portfolio Value</p>
            <p className="text-3xl font-bold">
              {totalValue > 0 ? `$${totalValue.toLocaleString()}` : '$0.00'}
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
                    key={holding.address}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={holding.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${holding.address}`}
                          alt={holding.name}
                          className="w-10 h-10 rounded-full bg-claw-dark"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${holding.address}`
                          }}
                        />
                        <div>
                          <p className="font-medium">{holding.name}</p>
                          <p className="text-sm text-gray-400">
                            {holding.balance.toLocaleString()} ${holding.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono">${holding.value.toFixed(2)}</p>
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
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-claw-primary/20 text-claw-primary rounded-lg hover:bg-claw-primary/30 transition-colors">
                        <Rocket size={16} />
                        <span>Boost</span>
                      </button>
                      <button 
                        onClick={() => setSwapModal({ 
                          open: true, 
                          token: holding, 
                          mode: 'sell' 
                        })}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <ArrowRightLeft size={16} />
                        <span>Swap</span>
                      </button>
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
    </div>
  )
}
