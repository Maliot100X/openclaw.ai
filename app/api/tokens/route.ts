import { NextRequest, NextResponse } from 'next/server'
import { fetchTrendingPools, fetchTopPools, transformPoolToToken } from '@/lib/api/geckoterminal'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chain = searchParams.get('chain') as 'base' | 'zora' | 'trending' || 'base'
    const page = parseInt(searchParams.get('page') || '1')

    let tokens: any[] = []

    if (chain === 'trending') {
      // Fetch trending from both chains
      const [baseTrending, zoraTrending] = await Promise.all([
        fetchTrendingPools('base', 1),
        fetchTrendingPools('zora', 1)
      ])

      const basePools = baseTrending?.data || []
      const zoraPools = zoraTrending?.data || []
      const baseIncluded = baseTrending?.included || []
      const zoraIncluded = zoraTrending?.included || []

      const baseTokens = basePools.slice(0, 5).map((p: any) => transformPoolToToken(p, 'base', baseIncluded))
      const zoraTokens = zoraPools.slice(0, 5).map((p: any) => transformPoolToToken(p, 'zora', zoraIncluded))

      // Combine and sort by price change
      tokens = [...baseTokens, ...zoraTokens]
        .sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h))
        .slice(0, 10)
    } else {
      // Fetch top pools for specific chain
      const poolsData = await fetchTopPools(chain, page)
      const pools = poolsData?.data || []
      const included = poolsData?.included || []

      tokens = pools.slice(0, 20).map((p: any) => transformPoolToToken(p, chain, included))
    }

    return NextResponse.json({
      success: true,
      chain,
      tokens,
      page,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}
