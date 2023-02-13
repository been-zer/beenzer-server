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
export const SYMBOL = String(process.env.NFT_SYMBOL);
export const NFT_MASTER_PUBKEY = String(process.env.NFT_MASTER);
export const MASTER_COLLECTION = new PublicKey(NFT_MASTER_PUBKEY);
export const NFT_MASTER_SUPPLY = 1000;
// Tokenomics
export const CURRENCY_SYMBOL = String(process.env.CURRENCY_SYMBOL);
export const CURRENCY_TOKEN = String(process.env.CURRENCY_TOKEN);
export const STOCK_SYMBOL = String(process.env.STOCK_SYMBOL);
export const STOCK_TOKEN = String(process.env.STOCK_TOKEN);
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
export const TOKEN_PUBLICKEY = new PublicKey(CURRENCY_TOKEN);
export const TOKEN = CURRENCY_TOKEN;
// Metaplex Connection
export const METAPLEX_BUNDLR_URI = "https://node1.bundlr.network";
// Marketplace
export const MARKET_PUBKEY = String(process.env.MARKET_WALLET);
export const MARKET_PUBLICKEY = new PublicKey(MARKET_PUBKEY);
export const MARKET_URL = String(process.env.MARKET_URL);
// DAO
export const DAO_PUBKEY = String(process.env.MARKET_WALLET);
export const DAO_PUBLICKEY = new PublicKey(DAO_PUBKEY);
export const DAO_URL = String(process.env.DAO_URL);
// SOCIALS
export const LANDING_URL = String(process.env.LANDING_URL);
export const DESCRIPTION =
  "Beenzer Collection is the NFT Master Edition for BEENZER official NFTs. Check our links to be part of the best web3 community! 💚";
export const TWITTER = "https://twitter.com/beenzer_app";
export const INSTAGRAM = "https://instagram.com/beenzer_app";
export const DISCORD = "https://discord.gg/Ta9X6zbg";
export const TELEGRAM = "https://t.me/+VgZorKQGP0gwY2Fk";
export const TIKTOK = "https://tiktok.com/beenzer_app";
export const YOUTUBE = "https://youtube.com/@beenzer";
export const OPENSEA = "https://opensea.com/beenzer_dapp";
export const MAGICEDEN = "https://magiceden.io/beenzer_dapp";
