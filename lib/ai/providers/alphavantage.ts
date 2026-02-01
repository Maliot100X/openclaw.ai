/**
 * AlphaVantage Market Data Provider
 */

const ALPHAVANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

export const AlphaVantageProvider = {
  isConfigured: () => !!process.env.ALPHAVANTAGE_API_KEY,

  getQuote: async (symbol: string): Promise<string> => {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY
    if (!apiKey) throw new Error('ALPHAVANTAGE_API_KEY not configured')

    const response = await fetch(
      `${ALPHAVANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('AlphaVantage API error')
    }

    const data = await response.json()
    const quote = data['Global Quote']

    if (!quote || Object.keys(quote).length === 0) {
      return `No data found for symbol: ${symbol}`
    }

    const price = quote['05. price']
    const change = quote['09. change']
    const changePercent = quote['10. change percent']
    const volume = quote['06. volume']

    return `📊 **${symbol}**
• Price: $${parseFloat(price).toFixed(2)}
• Change: ${change} (${changePercent})
• Volume: ${parseInt(volume).toLocaleString()}`
  },

  getCryptoExchange: async (from: string, to: string = 'USD'): Promise<string> => {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY
    if (!apiKey) throw new Error('ALPHAVANTAGE_API_KEY not configured')

    const response = await fetch(
      `${ALPHAVANTAGE_BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('AlphaVantage API error')
    }

    const data = await response.json()
    const rate = data['Realtime Currency Exchange Rate']

    if (!rate) {
      return `No exchange rate found for ${from}/${to}`
    }

    const price = rate['5. Exchange Rate']
    const bidPrice = rate['8. Bid Price']
    const askPrice = rate['9. Ask Price']

    return `💱 **${from}/${to}**
• Rate: $${parseFloat(price).toFixed(6)}
• Bid: $${parseFloat(bidPrice).toFixed(6)}
• Ask: $${parseFloat(askPrice).toFixed(6)}`
  },
}
