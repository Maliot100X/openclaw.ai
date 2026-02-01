// ============================================
// Farcaster-specific Types
// ============================================

// Neynar User Response
export interface NeynarUser {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  profile: {
    bio: {
      text: string
    }
  }
  follower_count: number
  following_count: number
  verifications: string[]
  verified_addresses: {
    eth_addresses: string[]
    sol_addresses: string[]
  }
  active_status: 'active' | 'inactive'
  custody_address: string
}

// Farcaster Frame Context
export interface FrameContext {
  fid: number
  url: string
  messageHash: string
  timestamp: number
  network: number
  buttonIndex: number
  inputText?: string
  castId: {
    fid: number
    hash: string
  }
}

// Mini App Context (Base & Farcaster)
export interface MiniAppContext {
  platform: 'farcaster' | 'base' | 'web'
  user?: {
    fid?: number
    address?: string
  }
  isEmbedded: boolean
}

// Notification Types
export interface FarcasterNotification {
  targetFids: number[]
  title: string
  body: string
  targetUrl?: string
}
