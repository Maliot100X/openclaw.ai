'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Search, Coins, Sparkles, TrendingUp, Loader2, AlertCircle, Flame, Clock } from 'lucide-react'
import CoinCard from '@/components/ui/CoinCard'
import type { Token, TokenSubTab } from '@/types'

type MiniTab = 'new' | 'trending'

const subTabs: { id: TokenSubTab; label: string; icon: typeof Coins; hasMiniTabs: boolean }[] = [
  { id: 'base', label: 'Base', icon: Coins, hasMiniTabs: true },
  { id: 'zora', label: 'Zora', icon: Sparkles, hasMiniTabs: true },
  { id: 'trending', label: 'Trending', icon: TrendingUp, hasMiniTabs: false },
]

export default function TokensTab() {
  const [activeSubTab, setActiveSubTab] = useState<TokenSubTab>('base')
  const [activeMiniTab, setActiveMiniTab] = useState<MiniTab>('new')
  const [searchQuery, setSearchQuery] = useState('')
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<Token | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Check if current main tab has mini tabs
  const currentTabConfig = subTabs.find(t => t.id === activeSubTab)
  const showMiniTabs = currentTabConfig?.hasMiniTabs || false

  // Fetch tokens based on active tab and mini tab
  useEffect(() => {
    async function fetchTokens() {
      setLoading(true)
      setError(null)
      
      try {
        // Build the API URL based on current selection
        let apiUrl = '/api/tokens?'
        
        if (activeSubTab === 'trending') {
          // Trending tab shows trending from both chains
          apiUrl += 'chain=trending'
        } else {
          // Base or Zora with mini tab selection
          apiUrl += `chain=${activeSubTab}&filter=${activeMiniTab}`
        }
        
        const res = await fetch(apiUrl)
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
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchTokens, 60000)
    return () => clearInterval(interval)
  }, [activeSubTab, activeMiniTab])

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
      // Try both chains if on trending tab
      const chainToSearch = activeSubTab === 'trending' ? 'base' : activeSubTab
      const res = await fetch(`/api/tokens/search?address=${searchQuery}&chain=${chainToSearch}`)
      const data = await res.json()
      
      if (data.success && data.token) {
        setSearchResult(data.token)
      } else {
        // If not found on first chain and we're on trending, try the other
        if (activeSubTab === 'trending') {
          const res2 = await fetch(`/api/tokens/search?address=${searchQuery}&chain=zora`)
          const data2 = await res2.json()
          if (data2.success && data2.token) {
            setSearchResult(data2.token)
          } else {
            setSearchError('Token not found on Base or Zora')
          }
        } else {
          setSearchError(data.error || 'Token not found')
        }
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

      {/* Main Sub-tabs */}
      <div className="flex gap-2 bg-claw-dark/50 p-1 rounded-xl">
        {subTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id)
                setActiveMiniTab('new') // Reset mini tab when switching
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

      {/* Mini Sub-tabs (only for Base and Zora) */}
      <AnimatePresence mode="wait">
        {showMiniTabs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <button
              onClick={() => setActiveMiniTab('new')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all border ${
                activeMiniTab === 'new'
                  ? 'border-claw-accent bg-claw-accent/20 text-claw-accent'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Clock size={16} />
              <span>New</span>
            </button>
            <button
              onClick={() => setActiveMiniTab('trending')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all border ${
                activeMiniTab === 'trending'
                  ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Flame size={16} />
              <span>Trending</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="w-full pl-12 pr-4 py-3 bg-claw-dark/50 rounded-xl border border-white/10 focus:border-claw-primary focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-4 py-3 bg-claw-primary rounded-xl font-medium hover:bg-claw-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-claw-primary rounded-xl p-1"
        >
          <div className="text-xs text-claw-primary px-3 py-1 font-medium">🔍 Search Result</div>
          <CoinCard 
            token={searchResult} 
            showBoostButton={true}
            showBuySell={true}
            showBoostPrices={true}
          />
        </motion.div>
      )}

      {/* Current Tab Label */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {activeSubTab === 'trending' 
            ? '🔥 Trending on Base & Zora'
            : `${showMiniTabs ? (activeMiniTab === 'new' ? '🆕 New' : '🔥 Trending') : ''} on ${activeSubTab.charAt(0).toUpperCase() + activeSubTab.slice(1)}`
          }
        </span>
        {!loading && (
          <span className="text-gray-500">{filteredTokens.length} tokens</span>
        )}
      </div>

      {/* Token List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="animate-spin text-claw-primary" size={32} />
          <p className="text-gray-400">Loading real token data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <AlertCircle className="text-red-400" size={32} />
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-claw-primary hover:underline"
          >
            Try again
          </button>
        </div>
      ) : filteredTokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Coins className="text-gray-500" size={32} />
          <p className="text-gray-400">No tokens found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTokens.map((token, index) => (
            <CoinCard
              key={`${token.address}-${token.chain}`}
              token={token}
              index={index}
              showBoostButton={true}
              showBuySell={true}
              showBoostPrices={true}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
