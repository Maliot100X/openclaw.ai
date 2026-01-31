/**
 * Mistral AI Provider
 */

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'
const MISTRAL_AGENT_URL = 'https://api.mistral.ai/v1/agents/completions'

export const MistralProvider = {
  isConfigured: () => !!process.env.MISTRAL_API_KEY,

  generate: async (prompt: string, systemPrompt: string): Promise<string> => {
    const apiKey = process.env.MISTRAL_API_KEY
    const agentId = process.env.MISTRAL_AGENT_ID
    if (!apiKey) throw new Error('MISTRAL_API_KEY not configured')

    // Use agent if configured, otherwise use standard chat
    const url = agentId ? MISTRAL_AGENT_URL : MISTRAL_API_URL
    const body = agentId
      ? {
          agent_id: agentId,
          messages: [{ role: 'user', content: `${systemPrompt}\n\n${prompt}` }],
        }
      : {
          model: 'mistral-small-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Mistral API error: ${error}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    
    if (!text) throw new Error('No response from Mistral')
    return text
  },
}
