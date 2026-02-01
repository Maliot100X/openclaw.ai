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
          <span style={{ fontSize: 100, marginRight: 30 }}>🛒</span>
          <span style={{ fontSize: 60, fontWeight: 'bold', color: '#ff6b6b' }}>
            Boost Shop
          </span>
        </div>

        <div
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #22c55e20 0%, #16a34a20 100%)',
            border: '2px solid #22c55e',
            borderRadius: 30,
            padding: 50,
            marginBottom: 40,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: 36, color: '#22c55e', marginBottom: 20 }}>Tier I - $1</span>
          <span style={{ fontSize: 28, color: '#ffffff' }}>10 min spotlight</span>
        </div>

        <div
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #3b82f620 0%, #2563eb20 100%)',
            border: '2px solid #3b82f6',
            borderRadius: 30,
            padding: 50,
            marginBottom: 40,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: 36, color: '#3b82f6', marginBottom: 20 }}>Tier II - $3</span>
          <span style={{ fontSize: 28, color: '#ffffff' }}>25 min visibility</span>
        </div>

        <div
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f59e0b20 0%, #d9790620 100%)',
            border: '2px solid #f59e0b',
            borderRadius: 30,
            padding: 50,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: 36, color: '#f59e0b', marginBottom: 20 }}>Tier III - $6</span>
          <span style={{ fontSize: 28, color: '#ffffff' }}>Global + Notifications</span>
        </div>

        <span style={{ fontSize: 32, color: '#a0a0a0', marginTop: 60 }}>
          Pay with ETH on Base
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
