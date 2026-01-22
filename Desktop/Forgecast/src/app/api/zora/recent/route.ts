import { getRecentCoins } from '@/lib/chain/zora'

const replacer = (key: string, value: any) => 
  typeof value === 'bigint' ? value.toString() : value

export async function GET() {
  const coins = await getRecentCoins(20)
  return new Response(JSON.stringify(coins, replacer), { status: 200 })
}
