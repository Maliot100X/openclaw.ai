'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import sdk from '@farcaster/frame-sdk'
import { FarcasterUser } from '@/types'
import { CHAINS } from '@/lib/constants'

interface Wallet {
  address: string
  type: 'farcaster' | 'base' | 'metamask'
  connected: boolean
}

interface TokenHolding {
  symbol: string
  name: string
  balance: string
  value: number
  isAppCoin: boolean
  address?: string
}

interface SocialConnection {
  platform: 'farcaster' | 'twitter' | 'telegram'
  connected: boolean
  username?: string
  icon: string
  color: string
}

export default function ProfileTab() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null)
  const [inMiniApp, setInMiniApp] = useState(false)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState<'wallets' | 'holdings' | 'social' | 'settings'>('wallets')
  const [holdingsFilter, setHoldingsFilter] = useState<'all' | 'app'>('all')
  const [holdings, setHoldings] = useState<TokenHolding[]>([])
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(false)
  const [userPoints, setUserPoints] = useState(0)

  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([
    { platform: 'farcaster', connected: false, icon: '🟣', color: 'purple' },
    { platform: 'twitter', connected: false, icon: '𝕏', color: 'black' },
    { platform: 'telegram', connected: false, icon: '✈️', color: 'blue' },
  ])

  useEffect(() => {
    // Immediate check for Mini App context
    if (typeof window !== 'undefined') {
      const isFrame = window.self !== window.top // Iframe check
      const urlParams = new URLSearchParams(window.location.search)
      const hasFid = urlParams.has('fid')

      if (isFrame || hasFid) {
        console.log('[Profile] Detailed Context: Mini App detected via iframe/params')
        setInMiniApp(true)
      }
    }
  }, [])

  useEffect(() => {
    initProfile()
  }, [])

  const initProfile = async () => {
    try {
      // Force ready again just in case
      try { sdk.actions.ready() } catch (e) { }

      const context = await sdk.context
      if (context?.user) {
        setInMiniApp(true)
        await syncFarcaster()
      }
    } catch (e) {
      console.warn('[Profile] Context check failed or timed out', e)
    }

    const savedSocials = localStorage.getItem('clawai_social_connections')
    if (savedSocials) setSocialConnections(JSON.parse(savedSocials))
  }

  const syncFarcaster = async () => {
    setIsSyncing(true)
    try {
      // Force ready signal before requesting context
      try { sdk.actions.ready() } catch (e) { console.debug('Ready signal already sent') }

      const context = await sdk.context
      console.log('[Profile] Farcaster context:', context)

      if (context?.user) {
        const user = context.user as unknown as FarcasterUser
        console.log('[Profile] Farcaster user:', user)
        setFarcasterUser(user)

        // Get wallet address
        let walletAddress: string | null = null
        const addresses: string[] = []

        if (user.verifiedAddresses?.ethAddresses && user.verifiedAddresses.ethAddresses.length > 0) {
          walletAddress = user.verifiedAddresses.ethAddresses[0]
          addresses.push(...user.verifiedAddresses.ethAddresses)
        } else if (user.custodyAddress) {
          walletAddress = user.custodyAddress
          addresses.push(user.custodyAddress)
        }

        // NON-BLOCKING: Sync user to database
        fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fid: user.fid,
            username: user.username,
            displayName: user.displayName,
            pfpUrl: user.pfp?.url,
            addresses: addresses,
            bio: user.profile?.bio?.text
          })
        }).then(res => res.json())
          .then(data => console.log('[Profile] Bg sync:', data))
          .catch(err => console.error('[Profile] Bg sync error:', err))

        if (walletAddress) {
          setWallets(prev => {
            // Avoid duplicates
            if (prev.find(w => w.type === 'farcaster' && w.address === walletAddress)) return prev

            const filtered = prev.filter(w => w.type !== 'farcaster')
            return [...filtered, { address: walletAddress!, type: 'farcaster', connected: true }]
          })
          // Load holdings without awaiting
          loadHoldings(walletAddress)
        }

        const newSocials = socialConnections.map(s =>
          s.platform === 'farcaster' ? { ...s, connected: true, username: user.username } : s
        )
        setSocialConnections(newSocials)
        localStorage.setItem('clawai_social_connections', JSON.stringify(newSocials))
      } else {
        // Fallback or just ignore if not in context
        console.log('[Profile] No user in context during sync')
      }
    } catch (error) {
      console.error('[Profile] Failed to sync Farcaster:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const loadHoldings = async (address: string) => {
    setIsLoadingHoldings(true)
    try {
      const response = await fetch(`/api/user/holdings?address=${address}`)
      if (response.ok) {
        const data = await response.json()
        if (data.holdings?.length > 0) {
          setHoldings(data.holdings)
          setIsLoadingHoldings(false)
          return
        }
      }

      const holdings: TokenHolding[] = [{ symbol: 'ETH', name: 'Ethereum (Base)', balance: 'Loading...', value: 0, isAppCoin: false }]
      const appCoins = localStorage.getItem('clawai_boosted_coins')
      if (appCoins) {
        JSON.parse(appCoins).forEach((coin: any) => {
          holdings.push({
            symbol: coin.symbol || 'TOKEN',
            name: coin.name || 'Boosted Token',
            balance: coin.balance || '0',
            value: coin.value || 0,
            isAppCoin: true,
            address: coin.address,
          })
        })
      }
      setHoldings(holdings)
    } catch (error) {
      console.error('[Profile] Failed to load holdings:', error)
    } finally {
      setIsLoadingHoldings(false)
    }
  }

  const connectBaseWallet = async () => {
    setIsConnecting('base')
    try {
      if (inMiniApp) {
        const provider = await sdk.wallet.ethProvider
        if (provider) {
          const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
          if (accounts?.length > 0) {
            try {
              // Strict Base Mainnet enforcement (8453 = 0x2105)
              const chainIdHex = `0x${CHAINS.BASE.id.toString(16)}`
              await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] })
            } catch (e: any) {
              if (e.code === 4902) {
                const chainIdHex = `0x${CHAINS.BASE.id.toString(16)}`
                await provider.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: chainIdHex,
                    chainName: CHAINS.BASE.name,
                    nativeCurrency: CHAINS.BASE.nativeCurrency,
                    rpcUrls: [CHAINS.BASE.rpc],
                    blockExplorerUrls: [CHAINS.BASE.explorer]
                  }],
                })
              }
            }
            // SIGN-IN ENFORCEMENT
            const message = `Sign in to ClawAI King Booster\nNonce: ${Date.now()}`
            try {
              await provider.request({
                method: 'personal_sign',
                params: [message, accounts[0]]
              })
              setWallets(prev => [...prev.filter(w => w.type !== 'base'), { address: accounts[0], type: 'base', connected: true }])
              await loadHoldings(accounts[0])
            } catch (err) {
              console.error('User rejected sign-in')
              return
            }
          }
        }
      } else {
        const ethereum = (window as any).ethereum
        if (ethereum) {
          const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
          try {
            const chainIdHex = `0x${CHAINS.BASE.id.toString(16)}`
            await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] })
          } catch (e: any) {
            if (e.code === 4902) {
              const chainIdHex = `0x${CHAINS.BASE.id.toString(16)}`
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: chainIdHex,
                  chainName: CHAINS.BASE.name,
                  nativeCurrency: CHAINS.BASE.nativeCurrency,
                  rpcUrls: [CHAINS.BASE.rpc],
                  blockExplorerUrls: [CHAINS.BASE.explorer]
                }],
              })
            }
          }
          if (accounts?.length > 0) {
            // SIGN-IN ENFORCEMENT
            const message = `Sign in to ClawAI King Booster\nNonce: ${Date.now()}`
            try {
              await ethereum.request({
                method: 'personal_sign',
                params: [message, accounts[0]]
              })
              // Only set connected if signed
              setWallets(prev => [...prev.filter(w => w.type !== 'base'), { address: accounts[0], type: 'base', connected: true }])
              await loadHoldings(accounts[0])
            } catch (err) {
              console.error('User rejected sign-in')
              return // Stop connection if rejected
            }
          }
        } else {
          window.open('https://metamask.io/download/', '_blank')
        }
      }
    } catch (error: any) {
      console.error('[Profile] Failed to connect Base wallet:', error)
      alert(error.code === 4001 ? 'Connection rejected.' : 'Failed to connect wallet: ' + (error.message || 'Unknown error'))
    } finally {
      setIsConnecting(null)
    }
  }

  const connectMetaMask = async () => {
    setIsConnecting('metamask')
    try {
      const ethereum = (window as any).ethereum
      if (ethereum) {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts?.length > 0) {
          setWallets(prev => [...prev.filter(w => w.type !== 'metamask'), { address: accounts[0], type: 'metamask', connected: true }])
          await loadHoldings(accounts[0])
        }
      } else {
        window.open('https://metamask.io/download/', '_blank')
      }
    } catch (error) {
      console.error('[Profile] Failed to connect MetaMask:', error)
    } finally {
      setIsConnecting(null)
    }
  }

  const connectSocial = async (platform: 'farcaster' | 'twitter' | 'telegram') => {
    setIsConnecting(platform)
    try {
      if (platform === 'farcaster') {
        if (inMiniApp) await syncFarcaster()
        else {
          alert('To connect Farcaster, please open this app inside Warpcast.')
          window.open('https://warpcast.com', '_blank')
        }
      } else if (platform === 'twitter') {
        const followUrl = 'https://twitter.com/intent/follow?screen_name=VoidDrillersX'
        if (inMiniApp) await sdk.actions.openUrl(followUrl)
        else window.open(followUrl, '_blank')
        const newSocials = socialConnections.map(s => s.platform === 'twitter' ? { ...s, connected: true, username: 'VoidDrillersX' } : s)
        setSocialConnections(newSocials)
        localStorage.setItem('clawai_social_connections', JSON.stringify(newSocials))
      } else if (platform === 'telegram') {
        const telegramUrl = 'https://t.me/ClawAIKing'
        if (inMiniApp) await sdk.actions.openUrl(telegramUrl)
        else window.open(telegramUrl, '_blank')
        const newSocials = socialConnections.map(s => s.platform === 'telegram' ? { ...s, connected: true, username: 'ClawAIKing' } : s)
        setSocialConnections(newSocials)
        localStorage.setItem('clawai_social_connections', JSON.stringify(newSocials))
      }
    } catch (error) {
      console.error(`[Profile] Failed to connect ${platform}:`, error)
    } finally {
      setIsConnecting(null)
    }
  }

  const disconnectSocial = (platform: 'farcaster' | 'twitter' | 'telegram') => {
    if (platform === 'farcaster' && inMiniApp) return
    const newSocials = socialConnections.map(s => s.platform === platform ? { ...s, connected: false, username: undefined } : s)
    setSocialConnections(newSocials)
    localStorage.setItem('clawai_social_connections', JSON.stringify(newSocials))
  }

  const formatAddress = (address: string) => {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  // Calculate filtered holdings
  const getFilteredHoldings = () => {
    return holdingsFilter === 'all' ? holdings : holdings.filter(h => h.isAppCoin);
  };

  const filteredHoldings = getFilteredHoldings();

  return (
    <div className="p-4 pb-24">
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 mb-6 border border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={farcasterUser?.pfp?.url || '/default-avatar.png'} alt="Profile" className="w-20 h-20 rounded-full border-2 border-purple-500" onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png' }} />
            {inMiniApp && <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1"><span className="text-xs">🟣</span></div>}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{farcasterUser?.displayName || 'Anonymous Claw'}</h2>
            <p className="text-gray-400 text-sm">@{farcasterUser?.username || 'anonymous'}</p>
            {farcasterUser?.fid && <p className="text-purple-400 text-xs mt-1">FID: {farcasterUser.fid}</p>}
          </div>
          <button
            onClick={() => {
              sdk.actions.ready() // Force ready signal on click
              syncFarcaster()
            }}
            disabled={isSyncing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSyncing ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Syncing...</span> : <span className="flex items-center gap-2">🔄 Sync</span>}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between bg-black/20 rounded-xl p-3">
          <span className="text-gray-400 text-sm">Total Points</span>
          <span className="text-xl font-bold text-claw-primary">{userPoints} pts</span>
        </div>
        {farcasterUser?.profile?.bio?.text && <p className="text-gray-300 text-sm mt-4 line-clamp-2">{farcasterUser.profile.bio.text}</p>}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[{ id: 'wallets', label: '💳 Wallets' }, { id: 'holdings', label: '📊 Holdings' }, { id: 'social', label: '🔗 Social' }, { id: 'settings', label: '⚙️ Settings' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeSubTab === tab.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'wallets' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Connected Wallets</h3>
            {wallets.length > 0 && (
              <div className="space-y-3">
                {wallets.map((wallet, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between border border-green-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center">
                        {wallet.type === 'farcaster' && '🟣'}{wallet.type === 'base' && '🔵'}{wallet.type === 'metamask' && '🦊'}
                      </div>
                      <div><p className="text-white font-medium capitalize">{wallet.type} Wallet</p><p className="text-gray-400 text-sm">{formatAddress(wallet.address)}</p></div>
                    </div>
                    <span className="text-green-400 text-sm">✓ Connected</span>
                  </div>
                ))}
                {/* WALLET CONNECTIONS - STRICTLY SEGREGATED */}
                <div className="space-y-3 mt-6 mb-6">

                  {/* WEB context only: Show explicit connect buttons */}
                  {!inMiniApp && (
                    <>
                      {!wallets.some(w => w.type === 'base') && (
                        <button onClick={connectBaseWallet} disabled={isConnecting === 'base'} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl p-4 flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                          {isConnecting === 'base' ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><span className="text-xl">🔵</span><span className="font-medium">Connect Base Wallet</span></>}
                        </button>
                      )}

                      {!wallets.some(w => w.connected) && (
                        <button onClick={connectMetaMask} disabled={isConnecting === 'metamask'} className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white rounded-xl p-4 flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                          {isConnecting === 'metamask' ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><span className="text-xl">🦊</span><span className="font-medium">Connect MetaMask</span></>}
                        </button>
                      )}
                    </>
                  )}

                  {/* MINI APP context: Active Sync Button */}
                  {inMiniApp && !wallets.some(w => w.connected) && (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          syncFarcaster()
                          connectBaseWallet()
                        }}
                        disabled={isSyncing || isConnecting === 'base'}
                        className="w-full bg-claw-primary hover:bg-claw-primary/80 text-black font-bold rounded-xl p-4 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                      >
                        {(isSyncing || isConnecting === 'base') ? (
                          <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <span className="text-xl">🟣</span>
                            <span>Sync Farcaster Profile</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        Tap to load your profile and wallet
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-4">
                  <button onClick={() => setHoldingsFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${holdingsFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>All Coins</button>
                  <button onClick={() => setHoldingsFilter('app')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${holdingsFilter === 'app' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>App Coins</button>
                </div>
                {wallets.length === 0 ? <div className="text-center py-8 bg-gray-800/30 rounded-xl"><p className="text-gray-400">Connect a wallet to view holdings</p></div>
                  : isLoadingHoldings ? <div className="text-center py-8"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-400">Loading holdings...</p></div>
                    : filteredHoldings.length === 0 ? <div className="text-center py-8 bg-gray-800/30 rounded-xl"><p className="text-gray-400">{holdingsFilter === 'app' ? 'No app coins yet. Boost some tokens!' : 'No tokens found'}</p></div>
                      : <div className="space-y-3">{filteredHoldings.map((token, index) => (
                        <div key={index} className={`bg-gray-800/50 rounded-xl p-4 flex items-center justify-between ${token.isAppCoin ? 'border border-purple-500/30' : ''}`}>
                          <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${token.isAppCoin ? 'bg-purple-900/50' : 'bg-gray-700'}`}><span className="text-lg">{token.symbol.slice(0, 2)}</span></div><div><p className="text-white font-medium">{token.symbol}</p><p className="text-gray-400 text-sm">{token.name}</p></div></div>
                          <div className="text-right"><p className="text-white font-medium">{token.balance}</p>{token.value > 0 && <p className="text-gray-400 text-sm">${token.value.toFixed(2)}</p>}</div>
                        </div>
                      ))}</div>}
              </motion.div>
            )}

            {activeSubTab === 'social' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Social Connections</h3>
                <p className="text-gray-400 text-sm mb-6">Connect your social accounts to enable auto-posting and earn more points!</p>
                <div className="space-y-3">
                  {socialConnections.map((social) => (
                    <div key={social.platform} className={`rounded-xl p-4 flex items-center justify-between border transition-all ${social.connected ? 'bg-gray-800/50 border-green-500/30' : 'bg-gray-800/30 border-gray-700/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${social.platform === 'farcaster' ? 'bg-purple-900/50' : social.platform === 'twitter' ? 'bg-gray-900' : 'bg-blue-900/50'}`}><span className="text-lg">{social.icon}</span></div>
                        <div><p className="text-white font-medium capitalize">{social.platform}</p>{social.connected && social.username && <p className="text-gray-400 text-sm">@{social.username}</p>}</div>
                      </div>
                      {social.connected ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-sm">✓ Connected</span>
                          {!(social.platform === 'farcaster' && inMiniApp) && <button onClick={() => disconnectSocial(social.platform)} className="text-gray-500 hover:text-red-400 text-sm ml-2">Disconnect</button>}
                        </div>
                      ) : (
                        <button onClick={() => connectSocial(social.platform)} disabled={isConnecting === social.platform} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${social.platform === 'farcaster' ? 'bg-purple-600 hover:bg-purple-500' : social.platform === 'twitter' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'} text-white`}>
                          {isConnecting === social.platform ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : 'Connect'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 mt-6">
                  <h4 className="text-white font-medium mb-2">🎁 Benefits of Connecting</h4>
                  <ul className="text-gray-400 text-sm space-y-2"><li>• Auto-post trading signals to your accounts</li><li>• Earn bonus points for sharing</li><li>• Unlock exclusive tasks in Share & Earn</li><li>• Verify tasks automatically</li></ul>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3">🔔 Notifications</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer"><span className="text-gray-300">Price Alerts</span><input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-purple-600" /></label>
                      <label className="flex items-center justify-between cursor-pointer"><span className="text-gray-300">Boost Notifications</span><input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-purple-600" /></label>
                      <label className="flex items-center justify-between cursor-pointer"><span className="text-gray-300">Task Reminders</span><input type="checkbox" className="w-5 h-5 rounded accent-purple-600" /></label>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3">🎨 Display</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer"><span className="text-gray-300">Show PnL in Profile</span><input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-purple-600" /></label>
                      <label className="flex items-center justify-between cursor-pointer"><span className="text-gray-300">Compact Mode</span><input type="checkbox" className="w-5 h-5 rounded accent-purple-600" /></label>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3">ℹ️ About</h4>
                    <div className="space-y-2 text-gray-400 text-sm"><p>OpenClaw AI v1.0.0</p><p>Built for Base & Farcaster</p><a href="https://github.com/Maliot100X/openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">GitHub Repository →</a></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  )
}
