import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Farcaster requires: 1284x2778px portrait PNG
export async function GET() {
  const response = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#0D0D1A',
          padding: 60,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 60,
          }}
        >
          <span style={{ fontSize: 100, marginRight: 30 }}>🏆</span>
          <span style={{ fontSize: 60, fontWeight: 'bold', color: '#ff6b6b' }}>
            Leaderboard
          </span>
        </div>

        <div
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #ffd70020 0%, #ffb30020 100%)',
            border: '2px solid #ffd700',
            borderRadius: 30,
            padding: 50,
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 60, marginRight: 30 }}>🥇</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 36, color: '#ffd700' }}>1st Place</span>
            <span style={{ fontSize: 28, color: '#ffffff' }}>$50 USDC Prize</span>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #c0c0c020 0%, #a0a0a020 100%)',
            border: '2px solid #c0c0c0',
            borderRadius: 30,
            padding: 50,
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 60, marginRight: 30 }}>🥈</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 36, color: '#c0c0c0' }}>2nd Place</span>
            <span style={{ fontSize: 28, color: '#ffffff' }}>$25 USDC Prize</span>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #cd7f3220 0%, #b8690020 100%)',
            border: '2px solid #cd7f32',
            borderRadius: 30,
            padding: 50,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 60, marginRight: 30 }}>🥉</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 36, color: '#cd7f32' }}>3rd Place</span>
            <span style={{ fontSize: 28, color: '#ffffff' }}>Free Boost + $1 Trial</span>
          </div>
        </div>

        <span style={{ fontSize: 32, color: '#a0a0a0', marginTop: 60 }}>
          Weekly prizes for top boosters
        </span>
      </div>
    ),
    {
      width: 1284,
      height: 2778,
    }
  )

  response.headers.set('Content-Type', 'image/png')
  response.headers.set('Cache-Control', 'public, max-age=86400')
  
  return response
}
