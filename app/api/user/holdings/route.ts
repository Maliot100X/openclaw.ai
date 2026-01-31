import { NextRequest, NextResponse } from 'next/server'

// API to fetch user's token holdings from on-chain data
// Uses multiple providers: Ankr, Alchemy, direct RPC

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

// Fetch ETH balance via RPC
async function getEthBalance(address: string, rpc: string): Promise<number> {
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    })
    const data = await res.json()
    if (data.result) {
      const balanceWei = parseInt(data.result, 16)
      return balanceWei / 1e18
    }
  } catch (e) {
    console.error('Error fetching ETH balance:', e)
  }
  return 0
}

// Fetch token balances via Ankr (free tier)
async function getTokenBalancesAnkr(address: string, chain: 'base' | 'eth'): Promise<TokenBalance[]> {
  try {
    const chainId = chain === 'base' ? 'base' : 'eth'
    const res = await fetch(`https://rpc.ankr.com/multichain/${chainId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'ankr_getAccountBalance',
        params: {
          blockchain: [chainId],
          walletAddress: address,
        },
        id: 1,
      }),
    })
    const data = await res.json()
    
    if (data.result?.assets) {
      return data.result.assets.map((asset: any) => ({
        address: asset.contractAddress || '0x0000000000000000000000000000000000000000',
        name: asset.tokenName || 'Unknown',
        symbol: asset.tokenSymbol || '???',
        chain: chain,
        balance: parseFloat(asset.balance) || 0,
        value: parseFloat(asset.balanceUsd) || 0,
        price: parseFloat(asset.tokenPrice) || 0,
        priceChange24h: 0,
        imageUrl: asset.thumbnail || null,
      }))
    }
  } catch (e) {
    console.error('Ankr API error:', e)
  }
  return []
}

// Fetch token list via direct ERC20 balance checks
async function getCommonTokenBalances(address: string, rpc: string, chain: string): Promise<TokenBalance[]> {
  // Common tokens on Base
  const commonTokens = chain === 'base' ? [
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
    { address: '0x4200000000000000000000000000000000000006', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
    { address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', name: 'Aerodrome', symbol: 'AERO', decimals: 18 },
    { address: '0x532f27101965dd16442E59d40670FaF5eBB142E4', name: 'Brett', symbol: 'BRETT', decimals: 18 },
    { address: '0xfA980cEd6895AC314E7dE34Ef1bFAE90a5AdD21b', name: 'Rekt', symbol: 'REKT', decimals: 18 },
  ] : [
    { address: '0x4200000000000000000000000000000000000006', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
  ]

  const holdings: TokenBalance[] = []

  // ERC20 balanceOf function signature
  const balanceOfSelector = '0x70a08231'
  const paddedAddress = address.slice(2).toLowerCase().padStart(64, '0')

  for (const token of commonTokens) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: token.address,
              data: balanceOfSelector + paddedAddress,
            },
            'latest',
          ],
          id: 1,
        }),
      })
      const data = await res.json()
      
      if (data.result && data.result !== '0x' && data.result !== '0x0') {
        const balanceRaw = BigInt(data.result)
        const balance = Number(balanceRaw) / Math.pow(10, token.decimals)
        
        if (balance > 0.0001) {
          holdings.push({
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            chain,
            balance,
            value: 0, // Would need price API
            price: 0,
            priceChange24h: 0,
            imageUrl: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/${token.address}/logo.png`,
          })
        }
      }
    } catch (e) {
      console.error(`Error fetching ${token.symbol} balance:`, e)
    }
  }

  return holdings
}

// Get ETH price from GeckoTerminal
async function getEthPrice(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      { next: { revalidate: 60 } }
    )
    const data = await res.json()
    const price = parseFloat(
      data?.data?.attributes?.token_prices?.['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'] || '3000'
    )
    return price
  } catch (e) {
    return 3000 // Fallback
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { success: false, error: 'Address is required' },
      { status: 400 }
    )
  }

  // Validate address format
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return NextResponse.json(
      { success: false, error: 'Invalid address format' },
      { status: 400 }
    )
  }

  try {
    const holdings: TokenBalance[] = []
    const ethPrice = await getEthPrice()

    // Get ETH balance on Base
    const baseEthBalance = await getEthBalance(address, BASE_RPC)
    if (baseEthBalance > 0.00001) {
      holdings.push({
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum',
        symbol: 'ETH',
        chain: 'base',
        balance: baseEthBalance,
        value: baseEthBalance * ethPrice,
        price: ethPrice,
        priceChange24h: 0,
        imageUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      })
    }

    // Get ETH balance on Zora
    const zoraEthBalance = await getEthBalance(address, ZORA_RPC)
    if (zoraEthBalance > 0.00001) {
      holdings.push({
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum',
        symbol: 'ETH',
        chain: 'zora',
        balance: zoraEthBalance,
        value: zoraEthBalance * ethPrice,
        price: ethPrice,
        priceChange24h: 0,
        imageUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      })
    }

    // Try to get token balances via Ankr (has free tier)
    try {
      const ankrBalances = await getTokenBalancesAnkr(address, 'base')
      // Filter out ETH since we already have it, and add the rest
      const nonEthBalances = ankrBalances.filter(b => b.symbol !== 'ETH' && b.balance > 0)
      holdings.push(...nonEthBalances)
    } catch (e) {
      console.log('Ankr not available, falling back to direct RPC')
      // Fallback: check common tokens directly
      const baseTokens = await getCommonTokenBalances(address, BASE_RPC, 'base')
      holdings.push(...baseTokens)
    }

    // Sort by value descending
    holdings.sort((a, b) => b.value - a.value)

    return NextResponse.json({
      success: true,
      address,
      holdings,
      totalValue: holdings.reduce((sum, h) => sum + h.value, 0),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Holdings API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch holdings' },
      { status: 500 }
    )
  }
}
