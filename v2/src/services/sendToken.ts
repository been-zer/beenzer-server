// sendToken.ts
// import payer_secret from "../keys/payer.json";
import {
  Connection,
  Transaction,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from "@solana/spl-token";
import dotenv from "dotenv";
dotenv.config();

export async function sendToken(
  _destination: PublicKey,
  _token: PublicKey,
  _amount: number = 1,
  _decimals: number = 0
) {
  const payer_secret = String(process.env.MASTER_WALLET_KEYPAIR).split(
    ","
  ) as any;
  const PAYER = Keypair.fromSecretKey(new Uint8Array(payer_secret));
  const SOLANA_RPC_URL: string = process.env.SOLANA_RPC_URL as string;
  const SOLANA_CONNECTION: Connection = new Connection(
    SOLANA_RPC_URL as string
  );
  const TOKEN_ACCOUNT: PublicKey = new PublicKey(
    process.env.TOKEN_ACCOUNT as string
  );
  const TOKEN_OWNER: PublicKey = new PublicKey(
    process.env.TOKEN_OWNER as string
  );
  const signTransaction = "processed";
  const amount = _amount * Math.pow(10, _decimals);

  // console.log(`3 - Fetching Number of Decimals for Mint: ${token}`);
  // const numberDecimals = 0; // await getNumberDecimals(MINT_ADDRESS);
  // console.log(`    Number of Decimals: ${numberDecimals}`);

  try {
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      SOLANA_CONNECTION,
      PAYER,
      _token,
      _destination,
      true,
      signTransaction
    );
    const tx = new Transaction().add(
      createTransferInstruction(
        TOKEN_ACCOUNT,
        toTokenAccount.address,
        TOKEN_OWNER,
        amount,
        [PAYER],
        TOKEN_PROGRAM_ID
      )
    );
    const blockHash = await SOLANA_CONNECTION.getLatestBlockhash();
    tx.feePayer = PAYER.publicKey;
    tx.recentBlockhash = blockHash.blockhash;
    const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION, tx, [
      PAYER,
    ]);
    console.log(
      "\x1b[32m",
      `   Transaction Success! 🎉  Sent ${_amount} ${_token.toBase58()} to ${_destination.toBase58()}`,
      `\n    https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`
    );
    return `Transaction Success! 🎉  Sent ${_amount} ${_token.toBase58()} to ${_destination.toBase58()}`;
  } catch (err) {
    console.log(err);
    console.log("SEND TOKEN FAILED!");
    return `Transaction Failed! ❌  Failed to send ${_amount} ${_token.toBase58()} to ${_destination.toBase58()}`;
  }
}

// v 1.0
