import { NextRequest, NextResponse } from 'next/server'
import { aiRouter } from '@/lib/ai/router'
import type { BotMode, BotMessage } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, mode, history } = body as {
      message: string
      mode: BotMode
      history?: BotMessage[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!mode || !['openclaw', 'market'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode' },
        { status: 400 }
      )
    }

    // Check for market data queries in market mode
    if (mode === 'market') {
      const symbolMatch = message.match(/\$?([A-Z]{1,5})/i)
      if (symbolMatch && (message.toLowerCase().includes('price') || message.toLowerCase().includes('quote'))) {
        const marketData = await aiRouter.getMarketData(symbolMatch[1].toUpperCase())
        if (!marketData.error) {
          return NextResponse.json(marketData)
        }
      }
    }

    // Use AI chat
    const result = await aiRouter.chat(message, mode, history || [])

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Bot Chat API] Error:', error)
    return NextResponse.json(
      {
        response: "Sorry, I'm having trouble right now. Please try again!",
        provider: 'gemini',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    providers: ['gemini', 'groq', 'mistral', 'apifree', 'aimlapi'],
    modes: ['openclaw', 'market'],
  })
}
