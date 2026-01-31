import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch active boosts for spotlight
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Get active boosts that haven't expired, sorted by tier (highest first)
    const { data: boosts, error } = await supabase
      .from('boosts')
      .select(`
        id,
        tier,
        price_usd,
        duration_minutes,
        start_time,
        end_time,
        is_active,
        tokens (
          id,
          address,
          name,
          symbol,
          chain,
          image_url
        ),
        users (
          id,
          fid,
          username,
          pfp_url
        )
      `)
      .eq('is_active', true)
      .gte('end_time', new Date().toISOString())
      .order('tier', { ascending: false })
      .order('start_time', { ascending: false })
      .limit(limit)

    if (error) throw error

    const activeBoosts = (boosts || []).map((boost: any) => ({
      id: boost.id,
      tier: boost.tier,
      price: boost.price_usd,
      durationMinutes: boost.duration_minutes,
      startTime: boost.start_time,
      endTime: boost.end_time,
      token: {
        id: boost.tokens?.id,
        address: boost.tokens?.address,
        name: boost.tokens?.name || 'Unknown',
        symbol: boost.tokens?.symbol || '???',
        chain: boost.tokens?.chain || 'base',
        imageUrl: boost.tokens?.image_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${boost.tokens?.address}`
      },
      user: {
        fid: boost.users?.fid,
        username: boost.users?.username || 'anon',
        pfpUrl: boost.users?.pfp_url
      }
    }))

    return NextResponse.json({
      success: true,
      boosts: activeBoosts,
      count: activeBoosts.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching boosts:', error)
    
    // Return empty array if no boosts or error
    return NextResponse.json({
      success: true,
      boosts: [],
      count: 0,
      message: 'No active boosts - be the first to boost!',
      timestamp: new Date().toISOString()
    })
  }
}

// POST - Create a new boost (requires auth)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tokenAddress, tokenChain, tier, transactionHash } = body

    if (!userId || !tokenAddress || !tier) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Tier pricing and duration
    const tierConfig: Record<number, { price: number; duration: number }> = {
      1: { price: 1, duration: 10 },
      2: { price: 3, duration: 25 },
      3: { price: 6, duration: 60 } // Global + notifications
    }

    const config = tierConfig[tier]
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier' },
        { status: 400 }
      )
    }

    // Check if token exists, create if not
    let { data: token } = await supabase
      .from('tokens')
      .select('id')
      .eq('address', tokenAddress)
      .eq('chain', tokenChain || 'base')
      .single()

    if (!token) {
      // Create token record
      const { data: newToken, error: tokenError } = await supabase
        .from('tokens')
        .insert({
          address: tokenAddress,
          chain: tokenChain || 'base',
          name: 'Unknown Token',
          symbol: '???',
          verified: false
        })
        .select('id')
        .single()

      if (tokenError) throw tokenError
      token = newToken
    }

    // Create boost
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + config.duration * 60000)

    const { data: boost, error: boostError } = await supabase
      .from('boosts')
      .insert({
        user_id: userId,
        token_id: token.id,
        tier,
        price_usd: config.price,
        duration_minutes: config.duration,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_active: true,
        transaction_hash: transactionHash
      })
      .select()
      .single()

    if (boostError) throw boostError

    return NextResponse.json({
      success: true,
      boost: {
        id: boost.id,
        tier,
        price: config.price,
        duration: config.duration,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      },
      message: `Boost activated! Your token will be featured for ${config.duration} minutes.`
    })
  } catch (error) {
    console.error('Error creating boost:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create boost' },
      { status: 500 }
    )
  }
}
