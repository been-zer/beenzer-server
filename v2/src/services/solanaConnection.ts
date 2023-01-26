import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();
// Connection
export const SOLANA_RPC_URL = String(process.env.SOLANA_RPC_URL);
export const SOLANA_CONNECTION = new Connection(SOLANA_RPC_URL);
// Master wallet
export const MASTER_PUBKEY = String(process.env.MASTER_WALLET);
export const MASTER_PUBLICKEY = new PublicKey(MASTER_PUBKEY);
export const MASTER_SECRET = String(process.env.MASTER_WALLET_KEYPAIR)
  .split(",")
  .map((x: string) => Number(x)) as Array<number>;
export const MASTER_KEYPAIR = Keypair.fromSecretKey(
  new Uint8Array(MASTER_SECRET)
);
// Master NFT Collection
export const MASTER_COLLECTION = new PublicKey(String(process.env.MASTER_COLLECTION));
// Main token
export const TOKEN = String(process.env.TOKEN);
export const TOKEN_PUBLICKEY = new PublicKey(TOKEN);
export const TOKEN_AUTHORITY = String(process.env.TOKEN_AUTHORITY);
export const TOKEN_SECRET = String(process.env.TOKEN_AUTHORITY_KEYPAIR)
  .split(",")
  .map((x: string) => Number(x)) as Array<number>;
export const TOKEN_KEYPAIR = Keypair.fromSecretKey(
  new Uint8Array(TOKEN_SECRET)
);
export const TOKEN_ACCOUNT = String(process.env.TOKEN_ACCOUNT);
export const TOKEN_ACCOUNT_PUBLICKEY = new PublicKey(TOKEN_ACCOUNT);
export const TOKEN_CREATOR = String(process.env.TOKEN_CREATOR);
export const TOKEN_CREATOR_PUBLICKEY = new PublicKey(TOKEN_CREATOR);
// Metaplex
export const METAPLEX_BUNDLR_URI = "https://node1.bundlr.network";
