import { getCoinsByCreator } from '@/lib/chain/zora'

const replacer = (key: string, value: any) => 
  typeof value === 'bigint' ? value.toString() : value

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address') || ''
  const coins = await getCoinsByCreator(address)
  return new Response(JSON.stringify(coins, replacer), { status: 200 })
}
