import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://openclaw-ai-one.vercel.app'

export const metadata: Metadata = {
  title: 'ClawAI King Booster',
  description: 'Boost your coins to the top! A Farcaster Mini App for token discovery and promotion on Base & Zora.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: '🦀 ClawAI King Booster',
    description: 'Boost your coins to the top! Discover trending tokens on Base & Zora. Get featured in ClawKing Spotlight!',
    url: APP_URL,
    siteName: 'ClawAI King',
    images: [
      {
        url: `${APP_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: 'ClawAI King - Boost your coins to the top!',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🦀 ClawAI King Booster',
    description: 'Boost your coins to the top! Discover trending tokens on Base & Zora.',
    images: [`${APP_URL}/api/og`],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${APP_URL}/api/og`,
    'fc:frame:button:1': '🦀 Launch App',
    'fc:frame:button:1:action': 'launch_frame',
    'fc:frame:button:1:target': APP_URL,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D0D1A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-claw-darker text-white`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
