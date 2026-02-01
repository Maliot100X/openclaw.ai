import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Farcaster requires: 1200x630px (1.91:1) PNG
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
          <span style={{ fontSize: 200 }}>🦀</span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#ff6b6b',
              marginTop: 20,
            }}
          >
            ClawAI King
          </span>
          <div
            style={{
              display: 'flex',
              gap: 20,
              marginTop: 30,
            }}
          >
            <span
              style={{
                background: '#0052FF',
                color: 'white',
                padding: '10px 30px',
                borderRadius: 20,
                fontSize: 28,
              }}
            >
              Base
            </span>
            <span
              style={{
                background: '#7C3AED',
                color: 'white',
                padding: '10px 30px',
                borderRadius: 20,
                fontSize: 28,
              }}
            >
              Zora
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )

  response.headers.set('Content-Type', 'image/png')
  response.headers.set('Cache-Control', 'public, max-age=86400')
  
  return response
}
