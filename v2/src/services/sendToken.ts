// sendToken.ts
// import payer_secret from "../keys/payer.json";
import {
  Connection,
  Transaction,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from "@solana/spl-token";
import dotenv from "dotenv";
dotenv.config();

export const sendToken = async (_pubkey: string, _amount: number = 1) => {
  const payer_secret =  String(process.env.MASTER_WALLET_KEYPAIR).split(',') as any;
  const PAYER = Keypair.fromSecretKey(new Uint8Array(payer_secret));
  const SOLANA_RPC_URL: string = process.env.SOLANA_RPC_URL as string;
  const SOLANA_CONNECTION: Connection = new Connection(SOLANA_RPC_URL as string);
  const TOKEN: PublicKey = new PublicKey(process.env.TOKEN as string);
  const TOKEN_ACCOUNT: PublicKey = new PublicKey(process.env.TOKEN_ACCOUNT as string);
  const TOKEN_OWNER: PublicKey = new PublicKey(process.env.TOKEN_OWNER as string);
  const DESTINATION_ACCOUNT = new PublicKey(_pubkey);
  const signTransaction = 'processed';
  const decimals = 2;
  const amount = _amount * Math.pow(10, decimals);

  try {
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      SOLANA_CONNECTION,
      PAYER,
      TOKEN,
      DESTINATION_ACCOUNT,
      true,
      signTransaction
    );
    const tx = new Transaction().add(
      createTransferInstruction(
        TOKEN_ACCOUNT, // source
        toTokenAccount.address, // dest
        TOKEN_OWNER,
        amount,
        [PAYER],
        TOKEN_PROGRAM_ID
      )
    );
    const blockHash = await SOLANA_CONNECTION.getLatestBlockhash();
    tx.feePayer = PAYER.publicKey;
    tx.recentBlockhash = blockHash.blockhash;
    const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION, tx, [PAYER]);
    console.log(
      '\x1b[32m', // Green Text
      `   Transaction Success! 🎉  Sent ${_amount} BEEN to ${_pubkey}`,
      `\n    https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`
    );
  } catch (err) {
    console.log(err)
  }
};

// v 1.0