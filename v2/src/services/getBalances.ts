import { Connection, PublicKey, TokenAccountsFilter } from '@solana/web3.js';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL as string;
const SOLANA_CONNECTION = new Connection(SOLANA_RPC_URL as string);
const PUBKEY = process.env.MASTER_WALLET as string;
const pubKey = new PublicKey(PUBKEY);

export async function balanceSOL (): Promise<number> {
  try {
    const res = pubKey ? await SOLANA_CONNECTION.getBalance(pubKey) : 0;
    return Math.floor((res/1000000000)*100)/100; // 1 billion lamports to 1 SOL (2 decimals)
  } catch (e) {
    console.log(e);
    return -1;
  }
}

export async function balanceUSD (): Promise<number> {
  try {
    const USDC = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    const token: TokenAccountsFilter = { mint: USDC }
    const accounts = await SOLANA_CONNECTION.getTokenAccountsByOwner( pubKey, token);
    const tokenAccount: PublicKey = accounts.value[0].pubkey;
    const tokenBalance = await SOLANA_CONNECTION.getTokenAccountBalance(tokenAccount);
    const balance = tokenBalance.value.amount;
    return Math.floor((Number(balance)/1000000) * 100) / 100;;
  } catch (e) {
    console.log(e);
    return -1;
  }
}

export default async function getBalances(): Promise<object> { 
  const SOL = await balanceSOL() || -1;
  const USD = await balanceUSD() || -1;
  console.log(SOL, 'SOL', USD, 'USD');
  return { SOL, USD };
}
