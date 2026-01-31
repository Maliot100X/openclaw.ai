import { NextRequest, NextResponse } from 'next/server'

const GECKO_BASE_URL = 'https://api.geckoterminal.com/api/v2'

// Chain network IDs for GeckoTerminal
const CHAIN_NETWORKS: Record<string, string> = {
  base: 'base',
  zora: 'zora-network',
  ethereum: 'eth',
}

interface GeckoPool {
  id: string
  type: string
  attributes: {
    name: string
    address: string
    base_token_price_usd: string
    quote_token_price_usd: string
    base_token_price_native_currency: string
    quote_token_price_native_currency: string
    pool_created_at: string
    reserve_in_usd: string
    fdv_usd: string
    market_cap_usd: string | null
    price_change_percentage: {
      h1: string
      h24: string
    }
    transactions: {
      h1: { buys: number; sells: number }
      h24: { buys: number; sells: number }
    }
    volume_usd: {
      h1: string
      h24: string
    }
  }
  relationships: {
    base_token: { data: { id: string } }
    quote_token: { data: { id: string } }
  }
}

interface GeckoToken {
  id: string
  type: string
  attributes: {
    name: string
    symbol: string
    address: string
    image_url: string | null
    coingecko_coin_id: string | null
  }
}

// Transform GeckoTerminal data to our Token format
function transformPoolToToken(pool: GeckoPool, includedTokens: GeckoToken[], chain: string) {
  const baseTokenId = pool.relationships.base_token.data.id
  const tokenInfo = includedTokens.find(t => t.id === baseTokenId)
  
  // Extract address from token ID (format: "network_address")
  const tokenAddress = tokenInfo?.attributes?.address || baseTokenId.split('_').pop() || ''
  
  return {
    id: pool.id,
    address: tokenAddress,
    chain: chain,
    name: tokenInfo?.attributes?.name || pool.attributes.name.split(' / ')[0] || 'Unknown',
    symbol: tokenInfo?.attributes?.symbol || pool.attributes.name.split(' / ')[0] || '???',
    imageUrl: tokenInfo?.attributes?.image_url || null,
    price: parseFloat(pool.attributes.base_token_price_usd) || 0,
    priceChange24h: parseFloat(pool.attributes.price_change_percentage?.h24) || 0,
    volume24h: parseFloat(pool.attributes.volume_usd?.h24) || 0,
    liquidity: parseFloat(pool.attributes.reserve_in_usd) || 0,
    fdv: parseFloat(pool.attributes.fdv_usd) || 0,
    poolAddress: pool.attributes.address,
    verified: !!tokenInfo?.attributes?.coingecko_coin_id,
    createdAt: pool.attributes.pool_created_at,
  }
}

// Fetch new pools (recently created)
async function fetchNewPools(chain: string) {
  const network = CHAIN_NETWORKS[chain] || chain
  
  try {
    const response = await fetch(
      `${GECKO_BASE_URL}/networks/${network}/new_pools?include=base_token&page=1`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )
    
    if (!response.ok) {
      console.error(`GeckoTerminal new pools error: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    const pools: GeckoPool[] = data.data || []
    const includedTokens: GeckoToken[] = data.included || []
    
    return pools.map(pool => transformPoolToToken(pool, includedTokens, chain))
  } catch (error) {
    console.error('Error fetching new pools:', error)
    return []
  }
}

// Fetch trending pools
async function fetchTrendingPools(chain: string) {
  const network = CHAIN_NETWORKS[chain] || chain
  
  try {
    const response = await fetch(
      `${GECKO_BASE_URL}/networks/${network}/trending_pools?include=base_token&page=1`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 },
      }
    )
    
    if (!response.ok) {
      console.error(`GeckoTerminal trending error: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    const pools: GeckoPool[] = data.data || []
    const includedTokens: GeckoToken[] = data.included || []
    
    return pools.map(pool => transformPoolToToken(pool, includedTokens, chain))
  } catch (error) {
    console.error('Error fetching trending pools:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const chain = searchParams.get('chain') || 'base'
  const filter = searchParams.get('filter') || 'trending' // 'new' or 'trending'
  
  try {
    let tokens = []
    
    if (chain === 'trending') {
      // Fetch trending from both Base and Zora
      const [baseTrending, zoraTrending] = await Promise.all([
        fetchTrendingPools('base'),
        fetchTrendingPools('zora'),
      ])
      
      // Merge and sort by volume
      tokens = [...baseTrending, ...zoraTrending]
        .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
        .slice(0, 20)
    } else {
      // Fetch based on filter (new or trending)
      if (filter === 'new') {
        tokens = await fetchNewPools(chain)
      } else {
        tokens = await fetchTrendingPools(chain)
      }
    }
    
    return NextResponse.json({
      success: true,
      chain,
      filter,
      tokens: tokens.slice(0, 20), // Limit to 20 tokens
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Token API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}
