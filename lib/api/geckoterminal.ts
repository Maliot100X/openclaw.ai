// GeckoTerminal API for real token data
// Network IDs: base, zora (not zora-network)

const GECKO_BASE_URL = process.env.GECKOTERMINAL_BASE_URL || 'https://api.geckoterminal.com/api/v2'

export interface GeckoToken {
  id: string
  type: string
  attributes: {
    address: string
    name: string
    symbol: string
    image_url: string | null
    coingecko_coin_id: string | null
    decimals: number
    total_supply: string
    price_usd: string | null
    fdv_usd: string | null
    total_reserve_in_usd: string | null
    volume_usd: {
      h24: string | null
    }
    market_cap_usd: string | null
  }
}

export interface GeckoPool {
  id: string
  type: string
  attributes: {
    name: string
    address: string
    base_token_price_usd: string | null
    quote_token_price_usd: string | null
    base_token_price_native_currency: string | null
    quote_token_price_native_currency: string | null
    pool_created_at: string
    reserve_in_usd: string | null
    fdv_usd: string | null
    market_cap_usd: string | null
    price_change_percentage: {
      h1: string | null
      h24: string | null
      h6: string | null
    }
    volume_usd: {
      h24: string | null
    }
  }
  relationships: {
    base_token: {
      data: { id: string; type: string }
    }
    quote_token: {
      data: { id: string; type: string }
    }
  }
}

// Network ID mapping - IMPORTANT: Zora is 'zora', not 'zora-network'
const getNetworkId = (chain: string): string => {
  const networkMap: Record<string, string> = {
    'base': 'base',
    'zora': 'zora',
    'eth': 'eth',
    'ethereum': 'eth',
  }
  return networkMap[chain.toLowerCase()] || chain
}

// Fetch trending pools for a chain
export async function fetchTrendingPools(chain: 'base' | 'zora', page: number = 1) {
  const network = getNetworkId(chain)
  
  try {
    const response = await fetch(
      `${GECKO_BASE_URL}/networks/${network}/trending_pools?page=${page}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    )

    if (!response.ok) {
      console.error(`GeckoTerminal trending_pools error for ${network}: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching trending pools for ${chain}:`, error)
    return null
  }
}

// Fetch new pools for a chain
export async function fetchNewPools(chain: 'base' | 'zora', page: number = 1) {
  const network = getNetworkId(chain)
  
  try {
    const response = await fetch(
      `${GECKO_BASE_URL}/networks/${network}/new_pools?page=${page}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 }
      }
    )

    if (!response.ok) {
      console.error(`GeckoTerminal new_pools error for ${network}: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching new pools for ${chain}:`, error)
    return null
  }
}

// Fetch top pools by volume for a chain
export async function fetchTopPools(chain: 'base' | 'zora', page: number = 1) {
  const network = getNetworkId(chain)
  
  try {
    const response = await fetch(
      `${GECKO_BASE_URL}/networks/${network}/pools?page=${page}&sort=h24_volume_usd_desc`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 }
      }
    )

    if (!response.ok) {
      console.error(`GeckoTerminal pools error for ${network}: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching top pools for ${chain}:`, error)
    return null
  }
}

// Search for token by address
export async function searchTokenByAddress(chain: 'base' | 'zora' | 'eth', address: string) {
  const network = getNetworkId(chain)
  
  try {
    const response = await fetch(
      `${GECKO_BASE_URL}/networks/${network}/tokens/${address}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null // Token not found
      }
      console.error(`GeckoTerminal token search error for ${network}: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error searching token ${address} on ${chain}:`, error)
    return null
  }
}

// Fetch token info with pools
export async function fetchTokenWithPools(chain: 'base' | 'zora', address: string) {
  const network = getNetworkId(chain)
  
  try {
    const response = await fetch(
      `${GECKO_BASE_URL}/networks/${network}/tokens/${address}/pools`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 }
      }
    )

    if (!response.ok) {
      console.error(`GeckoTerminal token pools error for ${network}: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching token pools:`, error)
    return null
  }
}

// Transform GeckoTerminal pool to our Token format
export function transformPoolToToken(pool: GeckoPool, chain: 'base' | 'zora', includedTokens?: any[]): any {
  const baseTokenId = pool.relationships?.base_token?.data?.id || ''
  const tokenAddress = baseTokenId.split('_')[1] || pool.attributes.address
  
  // Find token info from included data if available
  let tokenInfo: any = null
  if (includedTokens) {
    tokenInfo = includedTokens.find((t: any) => t.id === baseTokenId)
  }
  
  const name = tokenInfo?.attributes?.name || pool.attributes.name?.split(' / ')[0] || 'Unknown'
  const symbol = tokenInfo?.attributes?.symbol || name.split(' ')[0] || '???'
  const imageUrl = tokenInfo?.attributes?.image_url
  
  return {
    id: pool.id,
    address: tokenAddress,
    name: name,
    symbol: symbol,
    chain: chain,
    imageUrl: imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenAddress}`,
    price: parseFloat(pool.attributes.base_token_price_usd || '0'),
    priceChange24h: parseFloat(pool.attributes.price_change_percentage?.h24 || '0'),
    volume24h: parseFloat(pool.attributes.volume_usd?.h24 || '0'),
    marketCap: parseFloat(pool.attributes.market_cap_usd || '0'),
    fdv: parseFloat(pool.attributes.fdv_usd || '0'),
    liquidity: parseFloat(pool.attributes.reserve_in_usd || '0'),
    verified: !!tokenInfo?.attributes?.coingecko_coin_id,
    poolAddress: pool.attributes.address,
    createdAt: pool.attributes.pool_created_at
  }
}
