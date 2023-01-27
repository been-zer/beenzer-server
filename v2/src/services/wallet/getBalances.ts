import { PublicKey, TokenAccountsFilter } from "@solana/web3.js";
import { SOLANA_CONNECTION, MASTER_PUBLICKEY } from "../solanaConnection";

export async function balanceSOL(_publicKey: PublicKey): Promise<number> {
  try {
    const res = _publicKey ? await SOLANA_CONNECTION.getBalance(_publicKey) : 0;
    return Math.floor((res / 1000000000) * 100) / 100; // 1 billion lamports to 1 SOL (2 decimals)
  } catch (e) {
    console.log(e);
    return -1;
  }
}

export async function balanceUSD(_publicKey: PublicKey): Promise<number> {
  try {
    const USDC = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const token: TokenAccountsFilter = { mint: USDC };
    const accounts = await SOLANA_CONNECTION.getTokenAccountsByOwner(
      _publicKey,
      token
    );
    const tokenAccount: PublicKey = accounts.value[0].pubkey;
    const tokenBalance = await SOLANA_CONNECTION.getTokenAccountBalance(
      tokenAccount
    );
    const balance = tokenBalance.value.amount;
    return Math.floor((Number(balance) / 1000000) * 100) / 100;
  } catch (e) {
    console.log(e);
    return -1;
  }
}

export default async function getBalances(
  _publicKey: PublicKey = MASTER_PUBLICKEY
): Promise<object> {
  const SOL = (await balanceSOL(_publicKey)) || -1;
  const USD = (await balanceUSD(_publicKey)) || -1;
  console.log(SOL, "SOL", USD, "USD");
  return { SOL, USD };
}
