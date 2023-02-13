import { Connection, PublicKey, TokenAccountsFilter } from "@solana/web3.js";
import {
  SOLANA_CONNECTION,
  MASTER_PUBLICKEY,
  CURRENCY_SYMBOL,
  CURRENCY_TOKEN,
  STOCK_SYMBOL,
  STOCK_TOKEN,
} from "../solanaConnection";

export async function balanceSOL(
  publicKey: PublicKey,
  solanaConnection: Connection
): Promise<number> {
  try {
    const res = publicKey ? await solanaConnection.getBalance(publicKey) : 0;
    return Math.floor((res / 1000000000) * 100) / 100; // 1 billion lamports to 1 SOL (2 decimals)
  } catch (e) {
    console.log(e);
    return -1;
  }
}

export async function balanceUSDC(
  publicKey: PublicKey,
  solanaConnection: Connection
): Promise<number> {
  try {
    const USDC = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const token: TokenAccountsFilter = { mint: USDC };
    const accounts = await solanaConnection.getTokenAccountsByOwner(
      publicKey,
      token
    );
    const tokenAccount: PublicKey = accounts.value[0].pubkey;
    const tokenBalance = await solanaConnection.getTokenAccountBalance(
      tokenAccount
    );
    const balance = tokenBalance.value.amount;
    return Math.floor((Number(balance) / 1000000) * 100) / 100;
  } catch (e) {
    console.log(e);
    return -1;
  }
}

export async function balanceToken(
  publicKey: PublicKey,
  token_pubkey: string,
  solanaConnection: Connection
): Promise<number> {
  try {
    const Currency = new PublicKey(token_pubkey);
    const token: TokenAccountsFilter = { mint: Currency };
    const accounts = await solanaConnection.getTokenAccountsByOwner(
      publicKey,
      token
    );
    const tokenAccount: PublicKey = accounts.value[0].pubkey;
    const tokenBalance = await solanaConnection.getTokenAccountBalance(
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
  _publicKey: PublicKey = MASTER_PUBLICKEY,
  _solanaConnection: Connection = SOLANA_CONNECTION
): Promise<object> {
  const SOL = (await balanceSOL(_publicKey, _solanaConnection)) || -1;
  const USDC = (await balanceUSDC(_publicKey, _solanaConnection)) || -1;
  const Currency =
    (await balanceToken(_publicKey, CURRENCY_TOKEN, _solanaConnection)) || -1;
  const Stock =
    (await balanceToken(_publicKey, STOCK_TOKEN, _solanaConnection)) || -1;
  console.log(
    SOL,
    "SOL",
    USDC,
    "USDC",
    Currency,
    CURRENCY_SYMBOL,
    Stock,
    STOCK_SYMBOL
  );
  return { SOL, USDC };
}
