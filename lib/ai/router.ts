/**
 * AI Router with Multi-Provider Fallback
 * 
 * Provider chain: Gemini → Groq → Mistral → ApiFree → AIMLAPI
 * Automatically switches to next provider on failure
 */

import { GeminiProvider } from './providers/gemini'
import { GroqProvider } from './providers/groq'
import { MistralProvider } from './providers/mistral'
import { ApiFreeProvider } from './providers/apifree'
import { AIMLProvider } from './providers/aiml'
import { AlphaVantageProvider } from './providers/alphavantage'
import type { AIProvider, BotMode, BotMessage } from '@/types'

export interface AIResponse {
  response: string
  provider: AIProvider
  error?: string
}

interface Provider {
  name: AIProvider
  generate: (prompt: string, systemPrompt: string) => Promise<string>
  isConfigured: () => boolean
}

const SYSTEM_PROMPTS: Record<BotMode, string> = {
  openclaw: `You are OpenClaw AI, a helpful assistant for the ClawAI King Booster app.
You help users with:
- Understanding crypto tokens on Base and Zora chains
- Explaining how the boosting system works
- Farcaster tips and best practices
- General crypto questions

Be friendly, concise, and use emojis occasionally. Keep responses under 200 words.
If asked about specific prices or real-time data, suggest using the Market Intel mode.`,

  market: `You are Market Intel, a market data assistant for ClawAI King Booster.
You provide:
- Token price information
- Market trends analysis
- Trading insights
- Volume and holder data

Be precise with numbers. If you don't have real-time data, say so clearly.
Keep responses focused on market data and trading insights.`,
}

class AIRouter {
  private providers: Provider[] = []

  constructor() {
    // Initialize providers in fallback order
    this.providers = [
      {
        name: 'gemini',
        generate: GeminiProvider.generate,
        isConfigured: GeminiProvider.isConfigured,
      },
      {
        name: 'groq',
        generate: GroqProvider.generate,
        isConfigured: GroqProvider.isConfigured,
      },
      {
        name: 'mistral',
        generate: MistralProvider.generate,
        isConfigured: MistralProvider.isConfigured,
      },
      {
        name: 'apifree',
        generate: ApiFreeProvider.generate,
        isConfigured: ApiFreeProvider.isConfigured,
      },
      {
        name: 'aimlapi',
        generate: AIMLProvider.generate,
        isConfigured: AIMLProvider.isConfigured,
      },
    ]
  }

  async chat(
    message: string,
    mode: BotMode,
    history: BotMessage[] = []
  ): Promise<AIResponse> {
    const systemPrompt = SYSTEM_PROMPTS[mode]
    
    // Build conversation context
    const contextMessages = history
      .slice(-6) // Last 6 messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')

    const fullPrompt = contextMessages
      ? `${contextMessages}\nUser: ${message}`
      : message

    // Try each provider in order
    for (const provider of this.providers) {
      if (!provider.isConfigured()) {
        console.log(`[AI Router] ${provider.name} not configured, skipping`)
        continue
      }

      try {
        console.log(`[AI Router] Trying ${provider.name}...`)
        const response = await provider.generate(fullPrompt, systemPrompt)
        
        if (response && response.trim()) {
          console.log(`[AI Router] Success with ${provider.name}`)
          return {
            response,
            provider: provider.name,
          }
        }
      } catch (error) {
        console.error(`[AI Router] ${provider.name} failed:`, error)
        // Continue to next provider
      }
    }

    // All providers failed
    return {
      response: "I'm having trouble connecting to my AI systems right now. Please try again in a moment! 🔄",
      provider: 'gemini', // Default
      error: 'All providers failed',
    }
  }

  async getMarketData(symbol: string): Promise<AIResponse> {
    if (AlphaVantageProvider.isConfigured()) {
      try {
        const data = await AlphaVantageProvider.getQuote(symbol)
        return {
          response: data,
          provider: 'alphavantage',
        }
      } catch (error) {
        console.error('[AI Router] AlphaVantage failed:', error)
      }
    }

    return {
      response: 'Market data unavailable. Please try again later.',
      provider: 'alphavantage',
      error: 'AlphaVantage not available',
    }
  }
}

export const aiRouter = new AIRouter()
