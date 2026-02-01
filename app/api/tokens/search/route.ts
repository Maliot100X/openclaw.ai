import { NextRequest, NextResponse } from 'next/server'
import { searchTokenByAddress, fetchTokenWithPools, transformPoolToToken } from '@/lib/api/geckoterminal'

export const dynamic = 'force-dynamic'

// Detect chain from address format or explicit param
function detectChain(address: string, explicitChain?: string): 'base' | 'zora' | 'eth' {
  if (explicitChain && ['base', 'zora', 'eth'].includes(explicitChain)) {
    return explicitChain as 'base' | 'zora' | 'eth'
  }
  // Default to base, user can switch if needed
  return 'base'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || searchParams.get('address') || ''
    const explicitChain = searchParams.get('chain')

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Missing search query' },
        { status: 400 }
      )
    }

    // Check if it's a contract address (starts with 0x)
    const isAddress = query.toLowerCase().startsWith('0x') && query.length === 42

    if (isAddress) {
      // Search by contract address
      const chain = detectChain(query, explicitChain || undefined)
      
      // Try to find token on detected chain first
      let tokenData = await searchTokenByAddress(chain, query)
      
      // If not found on base, try zora
      if (!tokenData && chain === 'base') {
        tokenData = await searchTokenByAddress('zora', query)
        if (tokenData) {
          // Found on zora
          const poolsData = await fetchTokenWithPools('zora', query)
          if (poolsData?.data?.[0]) {
            const token = transformPoolToToken(poolsData.data[0], 'zora', poolsData.included)
            return NextResponse.json({
              success: true,
              token,
              chain: 'zora',
              source: 'geckoterminal'
            })
          }
        }
      }
      
      if (!tokenData) {
        return NextResponse.json({
          success: false,
          error: 'Token not found on Base or Zora',
          query
        }, { status: 404 })
      }

      // Get pools for the token
      const poolsData = await fetchTokenWithPools(chain as 'base' | 'zora', query)
      
      if (poolsData?.data?.[0]) {
        const token = transformPoolToToken(poolsData.data[0], chain as 'base' | 'zora', poolsData.included)
        return NextResponse.json({
          success: true,
          token,
          chain,
          source: 'geckoterminal'
        })
      }

      // Return basic token info if no pools found
      const attrs = tokenData.data?.attributes || {}
      return NextResponse.json({
        success: true,
        token: {
          id: query,
          address: query,
          name: attrs.name || 'Unknown',
          symbol: attrs.symbol || '???',
          chain,
          imageUrl: attrs.image_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${query}`,
          price: parseFloat(attrs.price_usd || '0'),
          priceChange24h: 0,
          volume24h: 0,
          verified: false
        },
        chain,
        source: 'geckoterminal'
      })
    } else {
      // Search by name/symbol - not directly supported by GeckoTerminal
      // Return suggestion to use contract address
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid contract address (0x...)',
        suggestion: 'Contract address search works best for finding specific tokens',
        query
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error searching token:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search token' },
      { status: 500 }
    )
  }
}
