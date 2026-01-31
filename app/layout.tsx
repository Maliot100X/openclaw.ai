import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ClawAI King Booster',
  description: 'Boost your coins to the top! A Farcaster Mini App for token discovery and promotion on Base & Zora.',
  openGraph: {
    title: 'ClawAI King Booster',
    description: 'Boost your coins to the top!',
    images: ['/og-image.png'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/og-image.png',
    'fc:frame:button:1': 'Launch App',
    'fc:frame:button:1:action': 'launch_frame',
    'fc:frame:button:1:target': process.env.NEXT_PUBLIC_APP_URL || 'https://openclaw.ai',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1A1A2E',
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
      </body>
    </html>
  )
}
