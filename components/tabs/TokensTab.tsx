'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Search, Coins, Sparkles, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import CoinCard from '@/components/ui/CoinCard'
import type { Token, TokenSubTab } from '@/types'

const subTabs: { id: TokenSubTab; label: string; icon: typeof Coins }[] = [
  { id: 'base', label: 'Base', icon: Coins },
  { id: 'zora', label: 'Zora', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
]

export default function TokensTab() {
  const [activeSubTab, setActiveSubTab] = useState<TokenSubTab>('base')
  const [searchQuery, setSearchQuery] = useState('')
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<Token | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Fetch tokens based on active tab
  useEffect(() => {
    async function fetchTokens() {
      setLoading(true)
      setError(null)
      
      try {
        const res = await fetch(`/api/tokens?chain=${activeSubTab}`)
        const data = await res.json()
        
        if (data.success) {
          setTokens(data.tokens || [])
        } else {
          setError(data.error || 'Failed to fetch tokens')
        }
      } catch (err) {
        console.error('Error fetching tokens:', err)
        setError('Failed to load tokens')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTokens()
  }, [activeSubTab])

  // Search by contract address
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    // Check if it's a contract address
    const isAddress = searchQuery.toLowerCase().startsWith('0x') && searchQuery.length === 42
    
    if (!isAddress) {
      setSearchError('Please enter a valid contract address (0x...)')
      return
    }
    
    setSearching(true)
    setSearchError(null)
    setSearchResult(null)
    
    try {
      const res = await fetch(`/api/tokens/search?address=${searchQuery}&chain=${activeSubTab}`)
      const data = await res.json()
      
      if (data.success && data.token) {
        setSearchResult(data.token)
      } else {
        setSearchError(data.error || 'Token not found')
      }
    } catch (err) {
      console.error('Search error:', err)
      setSearchError('Failed to search token')
    } finally {
      setSearching(false)
    }
  }

  // Filter displayed tokens (local filter for already loaded tokens)
  const filteredTokens = tokens.filter((coin) =>
    searchQuery === '' ||
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Coins className="text-claw-primary" size={28} />
        <h1 className="text-2xl font-bold">ClawWarTokens</h1>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 bg-claw-dark/50 p-1 rounded-xl">
        {subTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id)
                setSearchResult(null)
                setSearchError(null)
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-claw-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Paste contract address (0x...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSearchError(null)
                if (!e.target.value) setSearchResult(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 bg-claw-dark/50 border border-white/10 rounded-xl focus:outline-none focus:border-claw-primary transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-4 py-3 bg-claw-primary rounded-xl hover:bg-claw-primary/80 transition-colors disabled:opacity-50"
          >
            {searching ? <Loader2 size={20} className="animate-spin" /> : 'Search'}
          </button>
        </div>
        
        {searchError && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Search Result */}
      {searchResult && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Search Result:</p>
          <CoinCard token={searchResult} index={0} showBoostButton={true} />
        </div>
      )}

      {/* Info Banner */}
      <div className="card bg-gradient-to-r from-claw-primary/20 to-claw-secondary/20 border-claw-primary/30">
        <p className="text-sm">
          <span className="font-semibold">💡 Tip:</span> Boost any coin to the ClawKing Spotlight!
          Paste a contract address to find any token.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-claw-primary" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="card bg-red-500/10 border-red-500/30 text-center py-8">
          <AlertCircle size={32} className="mx-auto text-red-400 mb-2" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-claw-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Coin List */}
      {!loading && !error && (
        <div className="space-y-3">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token, index) => (
              <CoinCard
                key={token.id || token.address}
                token={token}
                index={index}
                showBoostButton={true}
              />
            ))
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-400">No tokens found</p>
              {searchQuery && (
                <p className="text-sm text-gray-500 mt-1">
                  Try pasting a contract address to search
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Live Data Notice */}
      {!loading && tokens.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          📊 Live data from GeckoTerminal • Updates every 60s
        </p>
      )}
    </motion.div>
  )
}
