import { client } from './client'
import { ZORA_FACTORY_ABI } from './abi'
import { parseAbiItem } from 'viem'

const FACTORY_ADDRESS = '0x777777751622c0d3258f214F9DF38E35BF45baF3'

export async function getRecentCoins(limit = 20) {
  const logs = await client.getLogs({
    address: FACTORY_ADDRESS,
    event: parseAbiItem('event CoinCreated(address indexed creator, address indexed coin, string name, string symbol, uint256 timestamp)'),
    fromBlock: 0n,
    toBlock: 'latest',
  })
  // Note: logs returned by viem with event parser have args populated
  return logs.slice(-limit).reverse()
}

export async function getCoinsByCreator(address: string) {
  const logs = await client.getLogs({
    address: FACTORY_ADDRESS,
    event: parseAbiItem('event CoinCreated(address indexed creator, address indexed coin, string name, string symbol, uint256 timestamp)'),
    fromBlock: 0n,
    toBlock: 'latest',
    args: { creator: address as `0x${string}` }
  })
  return logs
}

export async function getHoldings(address: string) {
  return [] // placeholder, implement ERC20 balance read if needed
}
