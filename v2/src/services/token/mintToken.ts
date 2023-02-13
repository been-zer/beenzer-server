// mintToken.ts
import { mintTo } from "@solana/spl-token";
import {
  SOLANA_CONNECTION,
  MASTER_KEYPAIR,
  TOKEN_KEYPAIR,
  TOKEN_PUBLICKEY,
  TOKEN_ACCOUNT_PUBLICKEY,
} from "../../config";
import dotenv from "dotenv";
dotenv.config();

export const mintToken = async (
  _amount: number = 1,
  _decimals: number = 2,
  _solanaConnection = SOLANA_CONNECTION
) => {
  const signature = await mintTo(
    _solanaConnection,
    MASTER_KEYPAIR,
    TOKEN_PUBLICKEY,
    TOKEN_ACCOUNT_PUBLICKEY,
    TOKEN_KEYPAIR,
    _amount * Math.pow(10, _decimals)
  );
  console.log(`Mint signature: ${signature}`);
};

mintToken();

// v 1.0
