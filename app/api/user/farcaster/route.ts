import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const NEYNAR_API_KEY = process.env.NEYNAR_APP_API_KEY

// Fetch user data from Neynar by FID or username
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    const username = searchParams.get('username')

    if (!fid && !username) {
      return NextResponse.json(
        { success: false, error: 'Missing fid or username' },
        { status: 400 }
      )
    }

    if (!NEYNAR_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Neynar API key not configured' },
        { status: 500 }
      )
    }

    let url = 'https://api.neynar.com/v2/farcaster/user/bulk'
    if (fid) {
      url += `?fids=${fid}`
    } else if (username) {
      // First lookup by username
      const lookupRes = await fetch(
        `https://api.neynar.com/v2/farcaster/user/by_username?username=${username}`,
        {
          headers: {
            'accept': 'application/json',
            'api_key': NEYNAR_API_KEY
          }
        }
      )
      
      if (!lookupRes.ok) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }
      
      const lookupData = await lookupRes.json()
      const user = lookupData.user
      
      return NextResponse.json({
        success: true,
        user: {
          fid: user.fid,
          username: user.username,
          displayName: user.display_name,
          pfpUrl: user.pfp_url,
          bio: user.profile?.bio?.text || '',
          followerCount: user.follower_count || 0,
          followingCount: user.following_count || 0,
          verifiedAddresses: user.verified_addresses?.eth_addresses || [],
          custodyAddress: user.custody_address
        }
      })
    }

    const res = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    })

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user data' },
        { status: res.status }
      )
    }

    const data = await res.json()
    const user = data.users?.[0]

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        bio: user.profile?.bio?.text || '',
        followerCount: user.follower_count || 0,
        followingCount: user.following_count || 0,
        verifiedAddresses: user.verified_addresses?.eth_addresses || [],
        custodyAddress: user.custody_address
      }
    })
  } catch (error) {
    console.error('Error fetching Farcaster user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
