/**
 * ApiFree.ai Provider (GPT-compatible)
 */

const APIFREE_API_URL = 'https://api.apifree.ai/v1/chat/completions'

export const ApiFreeProvider = {
  isConfigured: () => !!process.env.APIFREE_API_KEY,

  generate: async (prompt: string, systemPrompt: string): Promise<string> => {
    const apiKey = process.env.APIFREE_API_KEY
    if (!apiKey) throw new Error('APIFREE_API_KEY not configured')

    const response = await fetch(APIFREE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      throw new Error(`ApiFree API error: ${error}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    
    if (!text) throw new Error('No response from ApiFree')
    return text
  },
}
