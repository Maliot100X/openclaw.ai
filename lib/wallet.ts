// Wallet utilities for ClawAI King
// Detects Mini App (Farcaster/Base) vs Web environment

import { CHAINS } from './constants'

// Types for EIP-1193 provider
export interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

// Environment detection
export type AppEnvironment = 'farcaster' | 'base' | 'web'

// Check if running inside a Farcaster/Base Mini App
export function detectEnvironment(): AppEnvironment {
  if (typeof window === 'undefined') return 'web'

  // Check for Farcaster Mini App context
  // The SDK sets this when running in Warpcast or other Farcaster clients
  const userAgent = window.navigator.userAgent.toLowerCase()
  const referrer = document.referrer.toLowerCase()

  // Check if we're in an iframe (Mini Apps run in iframes)
  const isIframe = window !== window.parent

  // Check URL params that Farcaster/Base might pass
  const urlParams = new URLSearchParams(window.location.search)
  const hasFarcasterContext = urlParams.has('fid') || urlParams.has('fc_data')

  // Check for Base app indicators
  if (referrer.includes('base.org') || referrer.includes('coinbase')) {
    return 'base'
  }

  // Check for Farcaster/Warpcast indicators
  if (
    referrer.includes('warpcast') ||
    referrer.includes('farcaster') ||
    userAgent.includes('warpcast') ||
    hasFarcasterContext ||
    (isIframe && !referrer.includes('localhost'))
  ) {
    return 'farcaster'
  }

  return 'web'
}

// Get the appropriate Ethereum provider based on environment
export async function getProvider(): Promise<EIP1193Provider | null> {
  const env = detectEnvironment()

  if (env === 'farcaster' || env === 'base') {
    // Try to get Farcaster SDK provider
    try {
      const { sdk } = await import('@farcaster/frame-sdk')
      const provider = sdk.wallet.ethProvider
      if (provider) {
        console.log('[Wallet] Using Farcaster SDK provider')
        return provider as EIP1193Provider
      }
    } catch (e) {
      console.log('[Wallet] Farcaster SDK not available')
    }
    // STOP HERE for farcaster env - do not use window.ethereum
    return null
  }

  // Fallback to window.ethereum (MetaMask, etc) - WEB ONLY
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    console.log('[Wallet] Using window.ethereum provider')
    return (window as any).ethereum as EIP1193Provider
  }

  return null
}

// Connect wallet and return address
export async function connectWallet(): Promise<{ address: string; provider: EIP1193Provider } | null> {
  const provider = await getProvider()
  if (!provider) {
    throw new Error('No wallet found. Please use Warpcast or install MetaMask.')
  }

  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
    if (accounts && accounts.length > 0) {
      return { address: accounts[0], provider }
    }
  } catch (e: any) {
    if (e.code === 4001) {
      throw new Error('Connection rejected by user')
    }
    throw e
  }

  return null
}

// Switch to Base network
export async function switchToBase(provider: EIP1193Provider): Promise<void> {
  const chainIdHex = `0x${CHAINS.BASE.id.toString(16)}`

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch (switchError: any) {
    // Chain not added, try to add it
    if (switchError.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainIdHex,
          chainName: CHAINS.BASE.name,
          rpcUrls: [CHAINS.BASE.rpc],
          nativeCurrency: CHAINS.BASE.nativeCurrency,
          blockExplorerUrls: [CHAINS.BASE.explorer],
        }],
      })
    } else {
      throw switchError
    }
  }
}

// Get current chain ID
export async function getChainId(provider: EIP1193Provider): Promise<number> {
  const chainIdHex = await provider.request({ method: 'eth_chainId' }) as string
  return parseInt(chainIdHex, 16)
}

// Check if connected to Base
export async function isOnBase(provider: EIP1193Provider): Promise<boolean> {
  const chainId = await getChainId(provider)
  return chainId === CHAINS.BASE.id
}

// Send ETH transaction on Base
export async function sendBaseTransaction(
  provider: EIP1193Provider,
  from: string,
  to: string,
  valueWei: string,
  data?: string
): Promise<string> {
  // Ensure we're on Base
  if (!(await isOnBase(provider))) {
    await switchToBase(provider)
  }

  const txParams = {
    from,
    to,
    value: valueWei,
    ...(data && { data }),
  }

  const txHash = await provider.request({
    method: 'eth_sendTransaction',
    params: [txParams],
  }) as string

  return txHash
}
