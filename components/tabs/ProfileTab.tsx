'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { User, Wallet, RefreshCw, Check, AlertCircle, ExternalLink, Star, Rocket, Crown, Loader2, Search, Smartphone, Globe } from 'lucide-react'

interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  bio: string
  followerCount: number
  followingCount: number
  verifiedAddresses: string[]
  custodyAddress: string
}

interface WalletState {
  farcaster: { connected: boolean; address: string; synced: boolean }
  base: { connected: boolean; address: string }
  metamask: { connected: boolean; address: string }
}

// Detect if we're in a Mini App environment
const isMiniApp = () => {
  if (typeof window === 'undefined') return false
  // Check for Farcaster frame context
  const isInIframe = window.self !== window.top
  // Check user agent for Warpcast or Coinbase Wallet
  const ua = navigator.userAgent.toLowerCase()
  const isMobileWallet = ua.includes('warpcast') || ua.includes('coinbase')
  return isInIframe || isMobileWallet
}

// Detect if Base Wallet is available
const isBaseWallet = () => {
  if (typeof window === 'undefined') return false
  const eth = (window as any).ethereum
  return eth?.isCoinbaseWallet || eth?.isFrame
}

// Detect if MetaMask is available
const isMetaMask = () => {
  if (typeof window === 'undefined') return false
  const eth = (window as any).ethereum
  return eth?.isMetaMask && !eth?.isCoinbaseWallet
}

export default function ProfileTab() {
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [subscription, setSubscription] = useState<'none' | 'trial' | 'premium'>('none')
  const [inMiniApp, setInMiniApp] = useState(false)

  const [wallets, setWallets] = useState<WalletState>({
    farcaster: { connected: false, address: '', synced: false },
    base: { connected: false, address: '' },
    metamask: { connected: false, address: '' },
  })

  const connectedCount = Object.values(wallets).filter((w) => w.connected).length

  // Check environment on mount
  useEffect(() => {
    setInMiniApp(isMiniApp())
  }, [])

  // Sync Farcaster data by FID or username
  const handleSync = useCallback(async (query?: string) => {
    const searchQuery = query || searchInput.trim()
    if (!searchQuery) return

    setSyncing(true)
    setError(null)

    try {
      // Detect if it's a FID (number) or username
      const isNumeric = /^\d+$/.test(searchQuery)
      const param = isNumeric ? `fid=${searchQuery}` : `username=${searchQuery}`

      const res = await fetch(`/api/user/farcaster?${param}`)
      const data = await res.json()

      if (data.success && data.user) {
        setUser(data.user)
        
        // Update Farcaster wallet with custody address
        const fcAddress = data.user.custodyAddress || data.user.verifiedAddresses?.[0] || ''
        setWallets(prev => ({
          ...prev,
          farcaster: {
            connected: true,
            address: fcAddress,
            synced: true
          }
        }))

        // In Mini App, also set Base wallet to the verified address
        if (inMiniApp && data.user.verifiedAddresses?.length > 0) {
          setWallets(prev => ({
            ...prev,
            base: {
              connected: true,
              address: data.user.verifiedAddresses[0]
            }
          }))
        }

        // Save to localStorage for persistence
        localStorage.setItem('clawai_fid', String(data.user.fid))
        localStorage.setItem('clawai_user', JSON.stringify(data.user))
      } else {
        setError(data.error || 'User not found')
      }
    } catch (err) {
      console.error('Sync error:', err)
      setError('Failed to sync. Please try again.')
    } finally {
      setSyncing(false)
    }
  }, [searchInput, inMiniApp])

  // Load saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('clawai_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        const fcAddress = userData.custodyAddress || userData.verifiedAddresses?.[0] || ''
        setWallets(prev => ({
          ...prev,
          farcaster: {
            connected: true,
            address: fcAddress,
            synced: true
          }
        }))
        
        // In Mini App, also set Base wallet
        if (isMiniApp() && userData.verifiedAddresses?.length > 0) {
          setWallets(prev => ({
            ...prev,
            base: {
              connected: true,
              address: userData.verifiedAddresses[0]
            }
          }))
        }
      } catch (e) {
        localStorage.removeItem('clawai_user')
      }
    }
    
    // Check for existing wallet connections
    checkExistingWallets()
  }, [])

  // Check existing wallet connections on page load
  const checkExistingWallets = async () => {
    if (typeof window === 'undefined') return
    
    const eth = (window as any).ethereum
    if (!eth) return

    try {
      const accounts = await eth.request({ method: 'eth_accounts' })
      if (accounts && accounts.length > 0) {
        if (isBaseWallet()) {
          setWallets(prev => ({
            ...prev,
            base: { connected: true, address: accounts[0] }
          }))
        } else if (isMetaMask()) {
          setWallets(prev => ({
            ...prev,
            metamask: { connected: true, address: accounts[0] }
          }))
        }
      }
    } catch (e) {
      console.log('No existing wallet connection')
    }
  }

  // Connect Base wallet (for Mini App or Coinbase Wallet)
  const handleConnectBase = async () => {
    const eth = (window as any).ethereum
    
    if (inMiniApp) {
      // In Mini App, we use the synced Farcaster address
      if (user?.verifiedAddresses?.length) {
        setWallets(prev => ({
          ...prev,
          base: { connected: true, address: user.verifiedAddresses[0] }
        }))
        return
      } else {
        setError('Sync your Farcaster first to connect Base wallet')
        return
      }
    }

    // On web with Coinbase Wallet
    if (eth && isBaseWallet()) {
      try {
        const accounts = await eth.request({ method: 'eth_requestAccounts' })
        if (accounts[0]) {
          setWallets(prev => ({
            ...prev,
            base: { connected: true, address: accounts[0] }
          }))
        }
      } catch (err: any) {
        console.error('Base wallet connection error:', err)
        setError(err.message || 'Failed to connect wallet')
      }
    } else {
      // No Coinbase Wallet - show download link
      window.open('https://www.coinbase.com/wallet', '_blank')
    }
  }

  // Connect MetaMask (only for web)
  const handleConnectMetaMask = async () => {
    if (inMiniApp) {
      setError('MetaMask is not available in Mini App. Use your Farcaster wallet instead.')
      return
    }

    const eth = (window as any).ethereum
    
    if (eth && isMetaMask()) {
      try {
        const accounts = await eth.request({ method: 'eth_requestAccounts' })
        if (accounts[0]) {
          setWallets(prev => ({
            ...prev,
            metamask: { connected: true, address: accounts[0] }
          }))
        }
      } catch (err: any) {
        console.error('MetaMask connection error:', err)
        setError(err.message || 'Failed to connect MetaMask')
      }
    } else if (eth) {
      // Has provider but not MetaMask
      try {
        const accounts = await eth.request({ method: 'eth_requestAccounts' })
        if (accounts[0]) {
          setWallets(prev => ({
            ...prev,
            metamask: { connected: true, address: accounts[0] }
          }))
        }
      } catch (err: any) {
        console.error('Wallet connection error:', err)
        setError(err.message || 'Failed to connect wallet')
      }
    } else {
      window.open('https://metamask.io/download/', '_blank')
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="text-claw-primary" size={28} />
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        {/* Environment indicator */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
          inMiniApp 
            ? 'bg-purple-500/20 text-purple-400' 
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {inMiniApp ? <Smartphone size={14} /> : <Globe size={14} />}
          <span>{inMiniApp ? 'Mini App' : 'Web'}</span>
        </div>
      </div>

      {/* Sync Farcaster Section - Show if not connected */}
      {!user && (
        <div className="card bg-gradient-to-r from-purple-500/20 to-claw-primary/20 border-purple-500/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🟣</span> Connect your Farcaster
          </h3>
          <p className="text-sm text-gray-400 mb-3">
            Enter your Farcaster username or FID to sync your profile and wallet
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSync()}
              placeholder="username or FID (e.g. vitalik or 5650)"
              className="flex-1 px-4 py-3 bg-claw-darker border border-white/10 rounded-xl focus:outline-none focus:border-claw-primary"
            />
            <button
              onClick={() => handleSync()}
              disabled={syncing || !searchInput.trim()}
              className="px-4 py-3 bg-claw-primary rounded-xl hover:bg-claw-primary/80 transition-colors disabled:opacity-50"
            >
              {syncing ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>
      )}

      {/* Profile Card - Show if connected */}
      {user && (
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.pfpUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fid}`}
                alt={user.displayName}
                className="w-20 h-20 rounded-full border-2 border-claw-primary"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fid}`
                }}
              />
              {subscription !== 'none' && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-claw-secondary rounded-full flex items-center justify-center">
                  <Star size={16} className="text-yellow-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.displayName}</h2>
              <p className="text-gray-400">@{user.username}</p>
              <p className="text-sm text-claw-primary">FID: {user.fid}</p>
            </div>
            <button
              onClick={() => handleSync(String(user.fid))}
              disabled={syncing}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Refresh profile"
            >
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            </button>
          </div>
          {user.bio && (
            <p className="mt-4 text-gray-300">{user.bio}</p>
          )}
          <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xl font-bold">{user.followerCount.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
            <div>
              <p className="text-xl font-bold">{user.followingCount.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Following</p>
            </div>
            <div>
              <p className="text-xl font-bold text-claw-primary">0</p>
              <p className="text-sm text-gray-400">Boosts</p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connections */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-300 flex items-center gap-2">
          <Wallet size={18} />
          Wallet Connections
        </h3>

        {/* Farcaster Wallet - Primary in Mini App */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-lg">🟣</span>
              </div>
              <div>
                <p className="font-medium">Farcaster Wallet</p>
                {wallets.farcaster.connected ? (
                  <p className="text-sm text-green-400 font-mono">{formatAddress(wallets.farcaster.address)}</p>
                ) : (
                  <p className="text-sm text-gray-400">Sync Farcaster above to connect</p>
                )}
              </div>
            </div>
            {wallets.farcaster.connected ? (
              <div className="flex items-center gap-2 text-green-400">
                <Check size={18} />
                <span>Synced</span>
              </div>
            ) : (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Base Wallet - For Mini App transactions */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-lg">🔵</span>
              </div>
              <div>
                <p className="font-medium">Base Wallet</p>
                {wallets.base.connected ? (
                  <p className="text-sm text-green-400 font-mono">{formatAddress(wallets.base.address)}</p>
                ) : (
                  <p className="text-sm text-gray-400">
                    {inMiniApp ? 'Auto-connects with Farcaster' : 'Coinbase Wallet'}
                  </p>
                )}
              </div>
            </div>
            {wallets.base.connected ? (
              <div className="flex items-center gap-2 text-green-400">
                <Check size={18} />
                <span>Connected</span>
              </div>
            ) : (
              <button
                onClick={handleConnectBase}
                className="btn-primary text-sm py-2"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* MetaMask - Only for Web */}
        {!inMiniApp && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-lg">🦊</span>
                </div>
                <div>
                  <p className="font-medium">MetaMask / Web3</p>
                  {wallets.metamask.connected ? (
                    <p className="text-sm text-green-400 font-mono">{formatAddress(wallets.metamask.address)}</p>
                  ) : (
                    <p className="text-sm text-gray-400">For web browser access</p>
                  )}
                </div>
              </div>
              {wallets.metamask.connected ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Check size={18} />
                  <span>Connected</span>
                </div>
              ) : (
                <button
                  onClick={handleConnectMetaMask}
                  className="btn-primary text-sm py-2"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Mini App note */}
        {inMiniApp && (
          <p className="text-xs text-gray-500 text-center">
            📱 In Mini App mode - using Farcaster wallet for all transactions
          </p>
        )}
      </div>

      {/* Stats */}
      {user && (
        <div className="card">
          <h3 className="font-semibold text-gray-300 mb-3">Your Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-claw-darker rounded-xl">
              <Rocket className="mx-auto text-claw-primary mb-2" size={24} />
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-400">Total Boosts</p>
            </div>
            <div className="text-center p-3 bg-claw-darker rounded-xl">
              <Crown className="mx-auto text-yellow-400 mb-2" size={24} />
              <p className="text-2xl font-bold">$0</p>
              <p className="text-sm text-gray-400">Total Spent</p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Status */}
      <div className="card">
        <h3 className="font-semibold text-gray-300 mb-3">Subscription</h3>
        {subscription === 'none' ? (
          <div className="flex items-center justify-between">
            <p className="text-gray-400">No active subscription</p>
            <button className="text-claw-primary font-medium hover:underline">
              Upgrade →
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Star className="text-yellow-400" size={24} />
            <div>
              <p className="font-medium">{subscription === 'trial' ? 'Trial' : 'Premium'}</p>
              <p className="text-sm text-gray-400">Expires in 23 days</p>
            </div>
          </div>
        )}
      </div>

      {/* External Links */}
      {user && (
        <div className="flex gap-3">
          <a
            href={`https://warpcast.com/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 card-hover flex items-center justify-center gap-2 py-3"
          >
            <span>🟣</span>
            <span>Warpcast</span>
            <ExternalLink size={14} />
          </a>
          <a
            href={`https://basescan.org/address/${wallets.farcaster.address || wallets.base.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 card-hover flex items-center justify-center gap-2 py-3"
          >
            <span>🔵</span>
            <span>BaseScan</span>
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Disconnect option */}
      {user && (
        <button
          onClick={() => {
            setUser(null)
            setWallets({
              farcaster: { connected: false, address: '', synced: false },
              base: { connected: false, address: '' },
              metamask: { connected: false, address: '' },
            })
            localStorage.removeItem('clawai_user')
            localStorage.removeItem('clawai_fid')
          }}
          className="w-full py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          Disconnect Profile
        </button>
      )}
    </motion.div>
  )
}
