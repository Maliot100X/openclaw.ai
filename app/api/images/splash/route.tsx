import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Farcaster requires: 200x200px for splash
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
          background: '#0D0D1A',
        }}
      >
        <span style={{ fontSize: 120 }}>🦀</span>
      </div>
    ),
    {
      width: 200,
      height: 200,
    }
  )

  response.headers.set('Content-Type', 'image/png')
  response.headers.set('Cache-Control', 'public, max-age=86400')
  
  return response
}
