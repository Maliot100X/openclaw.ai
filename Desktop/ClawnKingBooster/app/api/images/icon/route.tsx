import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Farcaster requires: 1024x1024px PNG, no alpha
export async function GET() {
  const response = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 50%, #16213e 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 500, marginBottom: 20 }}>🦀</span>
          <span
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#ff6b6b',
              textShadow: '0 4px 20px rgba(255, 107, 107, 0.5)',
            }}
          >
            ClawAI
          </span>
        </div>
      </div>
    ),
    {
      width: 1024,
      height: 1024,
    }
  )

  // Set correct PNG headers
  response.headers.set('Content-Type', 'image/png')
  response.headers.set('Cache-Control', 'public, max-age=86400')
  
  return response
}
