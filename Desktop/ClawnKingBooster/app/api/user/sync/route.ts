import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

// POST - Sync Farcaster user to database
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { fid, username, displayName, pfpUrl, addresses, bio } = body

    if (!fid) {
      return NextResponse.json(
        { success: false, error: 'FID required' },
        { status: 400 }
      )
    }

    const userId = fid.toString()

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('fid', fid)
      .single()

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({
          username: username || 'anon',
          display_name: displayName || null,
          pfp_url: pfpUrl || null,
          addresses: addresses || [],
          bio: bio || null,
          verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('fid', fid)

      if (error) throw error

      return NextResponse.json({
        success: true,
        action: 'updated',
        userId: existingUser.id
      })
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          fid,
          username: username || 'anon',
          display_name: displayName || null,
          pfp_url: pfpUrl || null,
          addresses: addresses || [],
          bio: bio || null,
          verified: true
        })
        .select('id')
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        action: 'created',
        userId: newUser.id
      })
    }
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync user: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
