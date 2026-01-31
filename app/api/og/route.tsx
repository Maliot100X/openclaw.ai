import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0D0D1A',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #FF6B3530 0%, transparent 50%), radial-gradient(circle at 75% 75%, #9333EA30 0%, transparent 50%)',
          }}
        >
          {/* Logo and Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 30,
            }}
          >
            <span style={{ fontSize: 120, marginRight: 20 }}>🦀</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: 72,
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #FF6B35, #F7931A)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                ClawAI King
              </span>
              <span
                style={{
                  fontSize: 36,
                  color: '#9CA3AF',
                  marginTop: -10,
                }}
              >
                Boost your coins to the top!
              </span>
            </div>
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              marginTop: 30,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '16px 32px',
                borderRadius: 16,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span style={{ fontSize: 28, marginRight: 12 }}>🔵</span>
              <span style={{ fontSize: 24, color: 'white' }}>Base</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '16px 32px',
                borderRadius: 16,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span style={{ fontSize: 28, marginRight: 12 }}>🟣</span>
              <span style={{ fontSize: 24, color: 'white' }}>Zora</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '16px 32px',
                borderRadius: 16,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span style={{ fontSize: 28, marginRight: 12 }}>🚀</span>
              <span style={{ fontSize: 24, color: 'white' }}>Boost</span>
            </div>
          </div>

          {/* Farcaster Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 50,
              padding: '12px 24px',
              backgroundColor: 'rgba(138, 99, 210, 0.3)',
              borderRadius: 999,
              border: '1px solid rgba(138, 99, 210, 0.5)',
            }}
          >
            <span style={{ fontSize: 20, color: '#A78BFA' }}>
              ✨ Farcaster & Base Mini App
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e: any) {
    console.log(`Failed to generate OG image: ${e.message}`)
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
