'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { User, Wallet, RefreshCw, Check, AlertCircle, ExternalLink, Star, Rocket, Crown, Loader2, Search } from 'lucide-react'

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

export default function ProfileTab() {
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [subscription, setSubscription] = useState<'none' | 'trial' | 'premium'>('none')

  const [wallets, setWallets] = useState<WalletState>({
    farcaster: { connected: false, address: '', synced: false },
    base: { connected: false, address: '' },
    metamask: { connected: false, address: '' },
  })

  const connectedCount = Object.values(wallets).filter((w) => w.connected).length
  const allConnected = connectedCount === 3

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
  }, [searchInput])

  // Load saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('clawai_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setWallets(prev => ({
          ...prev,
          farcaster: {
            connected: true,
            address: userData.custodyAddress || userData.verifiedAddresses?.[0] || '',
            synced: true
          }
        }))
      } catch (e) {
        localStorage.removeItem('clawai_user')
      }
    }
  }, [])

  // Connect Base wallet via WalletConnect
  const handleConnectBase = async () => {
    // TODO: Full WalletConnect integration
    // For now, check if we have ethereum provider
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        if (accounts[0]) {
          setWallets(prev => ({
            ...prev,
            base: { connected: true, address: accounts[0] }
          }))
        }
      } catch (err) {
        console.error('Base wallet connection error:', err)
        setError('Failed to connect wallet')
      }
    } else {
      // Open WalletConnect or show instructions
      window.open('https://wallet.coinbase.com', '_blank')
    }
  }

  // Connect MetaMask
  const handleConnectMetaMask = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        if (accounts[0]) {
          setWallets(prev => ({
            ...prev,
            metamask: { connected: true, address: accounts[0] }
          }))
        }
      } catch (err) {
        console.error('MetaMask connection error:', err)
        setError('Failed to connect MetaMask')
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
      <div className="flex items-center gap-3">
        <User className="text-claw-primary" size={28} />
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      {/* Sync Farcaster Section - Show if not connected */}
      {!user && (
        <div className="card bg-gradient-to-r from-purple-500/20 to-claw-primary/20 border-purple-500/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🟣</span> Connect your Farcaster
          </h3>
          <p className="text-sm text-gray-400 mb-3">
            Enter your Farcaster username or FID to sync your profile
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

      {/* Connection Status Banner */}
      {!allConnected && user && (
        <div className="card bg-claw-primary/10 border-claw-primary/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-claw-primary flex-shrink-0" size={24} />
            <div>
              <p className="font-medium">Connect all wallets</p>
              <p className="text-sm text-gray-400">
                {connectedCount}/3 wallets connected. Connect all to unlock full features.
              </p>
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

        {/* Farcaster Wallet */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-lg">🟣</span>
              </div>
              <div>
                <p className="font-medium">Farcaster Wallet</p>
                {wallets.farcaster.connected ? (
                  <p className="text-sm text-green-400">{formatAddress(wallets.farcaster.address)}</p>
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

        {/* Base Wallet */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-lg">🔵</span>
              </div>
              <div>
                <p className="font-medium">Base Wallet</p>
                {wallets.base.connected ? (
                  <p className="text-sm text-green-400">{formatAddress(wallets.base.address)}</p>
                ) : (
                  <p className="text-sm text-gray-400">For Base Mini App payments</p>
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

        {/* MetaMask / Web Wallet */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="text-lg">🦊</span>
              </div>
              <div>
                <p className="font-medium">MetaMask / Web3</p>
                {wallets.metamask.connected ? (
                  <p className="text-sm text-green-400">{formatAddress(wallets.metamask.address)}</p>
                ) : (
                  <p className="text-sm text-gray-400">For web access</p>
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
