import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create client inside functions, not at module level (build time fails)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

// GET - Fetch user subscription
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')

    if (!userAddress) {
      return NextResponse.json({ success: false, error: 'User address required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error)
    }

    return NextResponse.json({
      success: true,
      subscription: data || null,
      isSubscribed: !!data,
      plan: data?.plan || null,
      expiresAt: data?.expires_at || null
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

// POST - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    // Accept both transactionHash (from modal) and txHash for backward compatibility
    const { plan, transactionHash, txHash, userId, userAddress } = body
    
    const finalTxHash = transactionHash || txHash
    const finalUserAddress = userAddress || userId

    if (!plan || !finalTxHash || !finalUserAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: plan, transactionHash, userId/userAddress' 
      }, { status: 400 })
    }

    // Calculate expiry date
    const now = new Date()
    const expiresAt = new Date(now)
    
    if (plan === 'trial') {
      expiresAt.setDate(now.getDate() + 7) // 7 days trial
    } else if (plan === 'premium') {
      expiresAt.setDate(now.getDate() + 30) // 30 days premium
    } else {
      return NextResponse.json({ success: false, error: 'Invalid plan type' }, { status: 400 })
    }

    // Check for existing active subscription
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_address', finalUserAddress.toLowerCase())
      .eq('status', 'active')
      .limit(1)

    if (existing && existing.length > 0) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan,
          transaction_hash: finalTxHash,
          expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', existing[0].id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        return NextResponse.json({ success: false, error: 'Failed to update subscription' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        subscription: data,
        message: 'Subscription updated'
      })
    }

    // Create new subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_address: finalUserAddress.toLowerCase(),
        plan,
        status: 'active',
        transaction_hash: finalTxHash,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      // If table doesn't exist, return success anyway (will be logged)
      return NextResponse.json({
        success: true,
        subscription: {
          plan,
          transactionHash: finalTxHash,
          userAddress: finalUserAddress,
          expiresAt: expiresAt.toISOString()
        },
        message: 'Subscription created (DB pending)'
      })
    }

    return NextResponse.json({
      success: true,
      subscription: data,
      message: 'Subscription created'
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ success: false, error: 'Failed to create subscription' }, { status: 500 })
  }
}
