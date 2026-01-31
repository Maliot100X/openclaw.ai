import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Create client inside functions, not at module level (build time fails)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'boosted_coins' // boosted_coins or top_buyers
    const period = searchParams.get('period') || '24h' // 24h, 7d, all

    // Calculate time filter
    let timeFilter = new Date()
    switch (period) {
      case '24h':
        timeFilter.setHours(timeFilter.getHours() - 24)
        break
      case '7d':
        timeFilter.setDate(timeFilter.getDate() - 7)
        break
      case 'all':
        timeFilter = new Date('2020-01-01') // Far past date for all time
        break
    }

    if (type === 'boosted_coins') {
      // Get top boosted coins
      const { data, error } = await supabase
        .from('boosts')
        .select(`
          token_id,
          tokens (
            id,
            address,
            name,
            symbol,
            chain,
            image_url
          )
        `)
        .gte('created_at', timeFilter.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      // Aggregate by token
      const tokenStats = new Map<string, any>()
      
      data?.forEach((boost: any) => {
        const tokenId = boost.token_id
        if (!tokenStats.has(tokenId)) {
          tokenStats.set(tokenId, {
            token: boost.tokens,
            boostCount: 0,
            totalSpent: 0
          })
        }
        const stats = tokenStats.get(tokenId)
        stats.boostCount += 1
        // Estimate spent based on tier (would need price from boost record)
        stats.totalSpent += 3 // Average boost price
      })

      // Sort by boost count and convert to array
      const leaderboard = Array.from(tokenStats.values())
        .sort((a, b) => b.boostCount - a.boostCount)
        .slice(0, 10)
        .map((item, index) => ({
          rank: index + 1,
          name: item.token?.name || 'Unknown',
          symbol: item.token?.symbol || '???',
          chain: item.token?.chain || 'base',
          image: item.token?.image_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.token?.address}`,
          boostCount: item.boostCount,
          totalSpent: item.totalSpent
        }))

      return NextResponse.json({
        success: true,
        type,
        period,
        leaderboard,
        prizes: {
          first: { amount: 50, currency: 'USDC', description: '$50 USDC' },
          second: { amount: 25, currency: 'USDC', description: '$25 USDC' },
          third: { amount: 0, currency: '', description: 'Free boost + $1 trial' }
        },
        timestamp: new Date().toISOString()
      })
    } else {
      // Get top buyers
      const { data, error } = await supabase
        .from('boosts')
        .select(`
          user_id,
          price_usd,
          users (
            id,
            fid,
            username,
            pfp_url
          )
        `)
        .gte('created_at', timeFilter.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      // Aggregate by user
      const userStats = new Map<string, any>()
      
      data?.forEach((boost: any) => {
        const userId = boost.user_id
        if (!userStats.has(userId)) {
          userStats.set(userId, {
            user: boost.users,
            boostsBought: 0,
            totalSpent: 0
          })
        }
        const stats = userStats.get(userId)
        stats.boostsBought += 1
        stats.totalSpent += parseFloat(boost.price_usd || 0)
      })

      // Sort by boosts bought and convert to array
      const leaderboard = Array.from(userStats.values())
        .sort((a, b) => b.boostsBought - a.boostsBought)
        .slice(0, 10)
        .map((item, index) => ({
          rank: index + 1,
          username: item.user?.username || 'anon',
          fid: item.user?.fid || 0,
          pfp: item.user?.pfp_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user?.fid}`,
          boostsBought: item.boostsBought,
          totalSpent: item.totalSpent
        }))

      return NextResponse.json({
        success: true,
        type,
        period,
        leaderboard,
        prizes: {
          first: { amount: 50, currency: 'USDC', description: '$50 USDC' },
          second: { amount: 25, currency: 'USDC', description: '$25 USDC' },
          third: { amount: 0, currency: '', description: 'Free boost + $1 trial' }
        },
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    
    // Return empty leaderboard if database is empty or error
    return NextResponse.json({
      success: true,
      type: 'boosted_coins',
      period: '24h',
      leaderboard: [],
      prizes: {
        first: { amount: 50, currency: 'USDC', description: '$50 USDC' },
        second: { amount: 25, currency: 'USDC', description: '$25 USDC' },
        third: { amount: 0, currency: '', description: 'Free boost + $1 trial' }
      },
      message: 'No boosts yet - be the first to boost!',
      timestamp: new Date().toISOString()
    })
  }
}
