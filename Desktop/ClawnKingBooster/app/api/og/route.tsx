import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const revalidate = 86400 // Cache for 24 hours

// Optimized OG Image - 1200x630px for Farcaster
export async function GET() {
  return new ImageResponse(
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
          <div style={{ display: 'flex', gap: 20, marginTop: 30 }}>
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
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  )
}
