'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { User, Wallet, RefreshCw, Check, AlertCircle, ExternalLink, Star, Rocket, Crown } from 'lucide-react'

interface WalletState {
  farcaster: { connected: boolean; address: string; synced: boolean }
  base: { connected: boolean; address: string }
  metamask: { connected: boolean; address: string }
}

// Mock user data - will be replaced with real Neynar data
const mockUser = {
  fid: 12345,
  username: 'clawuser',
  displayName: 'Claw User',
  pfpUrl: 'https://via.placeholder.com/120/FF6B35/fff?text=CU',
  bio: 'Boosting my favorite coins on ClawAI King! 🦀',
  followerCount: 420,
  followingCount: 69,
}

export default function ProfileTab() {
  const [wallets, setWallets] = useState<WalletState>({
    farcaster: { connected: true, address: '0x1234...5678', synced: true },
    base: { connected: false, address: '' },
    metamask: { connected: false, address: '' },
  })
  const [syncing, setSyncing] = useState(false)
  const [subscription, setSubscription] = useState<'none' | 'trial' | 'premium'>('none')

  const connectedCount = Object.values(wallets).filter((w) => w.connected).length
  const allConnected = connectedCount === 3

  const handleSync = async () => {
    setSyncing(true)
    // Simulate sync
    await new Promise((r) => setTimeout(r, 1500))
    setWallets((prev) => ({
      ...prev,
      farcaster: { ...prev.farcaster, synced: true },
    }))
    setSyncing(false)
  }

  const handleConnectBase = () => {
    // TODO: Implement WalletConnect for Base
    setWallets((prev) => ({
      ...prev,
      base: { connected: true, address: '0xbase...1234' },
    }))
  }

  const handleConnectMetaMask = () => {
    // TODO: Implement MetaMask connection
    setWallets((prev) => ({
      ...prev,
      metamask: { connected: true, address: '0xmeta...5678' },
    }))
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

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={mockUser.pfpUrl}
              alt={mockUser.displayName}
              className="w-20 h-20 rounded-full border-2 border-claw-primary"
            />
            {subscription !== 'none' && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-claw-secondary rounded-full flex items-center justify-center">
                <Star size={16} className="text-yellow-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{mockUser.displayName}</h2>
            <p className="text-gray-400">@{mockUser.username}</p>
            <p className="text-sm text-gray-500">FID: {mockUser.fid}</p>
          </div>
        </div>
        {mockUser.bio && (
          <p className="mt-4 text-gray-300">{mockUser.bio}</p>
        )}
        <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xl font-bold">{mockUser.followerCount}</p>
            <p className="text-sm text-gray-400">Followers</p>
          </div>
          <div>
            <p className="text-xl font-bold">{mockUser.followingCount}</p>
            <p className="text-sm text-gray-400">Following</p>
          </div>
          <div>
            <p className="text-xl font-bold text-claw-primary">7</p>
            <p className="text-sm text-gray-400">Boosts</p>
          </div>
        </div>
      </div>

      {/* Connection Status Banner */}
      {!allConnected && (
        <div className="card bg-claw-primary/10 border-claw-primary/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-claw-primary" size={24} />
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
          Wallet Connections (Required)
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
                  <p className="text-sm text-gray-400">Auto-detected from Farcaster</p>
                )}
              </div>
            </div>
            {wallets.farcaster.connected ? (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                <span>{syncing ? 'Syncing...' : 'Sync'}</span>
              </button>
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
                  <p className="text-sm text-gray-400">For Base Mini App</p>
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
      <div className="card">
        <h3 className="font-semibold text-gray-300 mb-3">Your Activity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-claw-darker rounded-xl">
            <Rocket className="mx-auto text-claw-primary mb-2" size={24} />
            <p className="text-2xl font-bold">7</p>
            <p className="text-sm text-gray-400">Total Boosts</p>
          </div>
          <div className="text-center p-3 bg-claw-darker rounded-xl">
            <Crown className="mx-auto text-yellow-400 mb-2" size={24} />
            <p className="text-2xl font-bold">$42</p>
            <p className="text-sm text-gray-400">Total Spent</p>
          </div>
        </div>
      </div>

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
      <div className="flex gap-3">
        <a
          href={`https://warpcast.com/${mockUser.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 card-hover flex items-center justify-center gap-2 py-3"
        >
          <span>🟣</span>
          <span>Warpcast</span>
          <ExternalLink size={14} />
        </a>
        <a
          href={`https://basescan.org/address/${wallets.farcaster.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 card-hover flex items-center justify-center gap-2 py-3"
        >
          <span>🔵</span>
          <span>BaseScan</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </motion.div>
  )
}
