import { NextRequest, NextResponse } from 'next/server'

// API to fetch user's token holdings from on-chain data
// Uses Alchemy/Moralis-style API or direct RPC calls

const BASE_RPC = process.env.BASE_RPC || 'https://mainnet.base.org'
const ZORA_RPC = process.env.ZORA_RPC || 'https://rpc.zora.energy'

interface TokenBalance {
  address: string
  name: string
  symbol: string
  chain: string
  balance: number
  value: number
  price: number
  priceChange24h: number
  imageUrl: string | null
}

// For now, return empty array - will integrate with token balance API
// Options: Alchemy SDK, Moralis, or Covalent API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { success: false, error: 'Address is required' },
      { status: 400 }
    )
  }

  try {
    // TODO: Integrate with token balance API
    // For now, we'll try to get ETH balance at least
    const holdings: TokenBalance[] = []

    // Get ETH balance on Base
    try {
      const baseEthRes = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      })
      const baseEthData = await baseEthRes.json()
      
      if (baseEthData.result) {
        const balanceWei = parseInt(baseEthData.result, 16)
        const balanceEth = balanceWei / 1e18
        
        if (balanceEth > 0.0001) {
          // Get ETH price from GeckoTerminal
          const priceRes = await fetch('https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
          const priceData = await priceRes.json()
          const ethPrice = parseFloat(priceData?.data?.attributes?.token_prices?.['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'] || '3000')
          
          holdings.push({
            address: '0x0000000000000000000000000000000000000000',
            name: 'Ethereum',
            symbol: 'ETH',
            chain: 'base',
            balance: balanceEth,
            value: balanceEth * ethPrice,
            price: ethPrice,
            priceChange24h: 0, // Would need historical data
            imageUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
          })
        }
      }
    } catch (e) {
      console.error('Error fetching Base ETH balance:', e)
    }

    // Get ETH balance on Zora
    try {
      const zoraEthRes = await fetch(ZORA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      })
      const zoraEthData = await zoraEthRes.json()
      
      if (zoraEthData.result) {
        const balanceWei = parseInt(zoraEthData.result, 16)
        const balanceEth = balanceWei / 1e18
        
        if (balanceEth > 0.0001) {
          const ethPrice = 3000 // Fallback price
          
          holdings.push({
            address: '0x0000000000000000000000000000000000000000',
            name: 'Ethereum',
            symbol: 'ETH',
            chain: 'zora',
            balance: balanceEth,
            value: balanceEth * ethPrice,
            price: ethPrice,
            priceChange24h: 0,
            imageUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
          })
        }
      }
    } catch (e) {
      console.error('Error fetching Zora ETH balance:', e)
    }

    return NextResponse.json({
      success: true,
      address,
      holdings,
      timestamp: new Date().toISOString(),
      note: holdings.length === 0 
        ? 'No significant balances found. ERC-20 tokens require additional API integration.' 
        : undefined,
    })
  } catch (error) {
    console.error('Holdings API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch holdings' },
      { status: 500 }
    )
  }
}
