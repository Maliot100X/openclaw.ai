import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Farcaster screenshot - same as screenshot1
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
          <span style={{ fontSize: 100, marginRight: 30 }}>🦀</span>
          <span style={{ fontSize: 60, fontWeight: 'bold', color: '#ff6b6b' }}>
            ClawAI King
          </span>
        </div>

        <div
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 30,
            padding: 50,
            marginBottom: 40,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: 36, color: '#ff6b6b', marginBottom: 20 }}>
            ClawKing Spotlight
          </span>
          <span style={{ fontSize: 28, color: '#ffffff' }}>Featured boosted coins</span>
        </div>

        <div
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 30,
            padding: 50,
            marginBottom: 40,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: 36, color: '#0052FF', marginBottom: 20 }}>Base Trending</span>
          <span style={{ fontSize: 28, color: '#ffffff' }}>Live token data</span>
        </div>

        <div
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 30,
            padding: 50,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: 36, color: '#7C3AED', marginBottom: 20 }}>Zora Trending</span>
          <span style={{ fontSize: 28, color: '#ffffff' }}>Discover new coins</span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 30,
            marginTop: 80,
          }}
        >
          <span style={{ background: '#0052FF', color: 'white', padding: '20px 50px', borderRadius: 20, fontSize: 32 }}>Base</span>
          <span style={{ background: '#7C3AED', color: 'white', padding: '20px 50px', borderRadius: 20, fontSize: 32 }}>Zora</span>
        </div>
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
