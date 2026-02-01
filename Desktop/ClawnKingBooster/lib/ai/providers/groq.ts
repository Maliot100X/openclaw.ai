/**
 * Groq AI Provider (Fast LLM inference)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const GroqProvider = {
  isConfigured: () => !!process.env.GROQ_API_KEY,

  generate: async (prompt: string, systemPrompt: string): Promise<string> => {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY not configured')

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq API error: ${error}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    
    if (!text) throw new Error('No response from Groq')
    return text
  },
}
