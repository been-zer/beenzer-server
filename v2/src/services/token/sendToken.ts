// sendToken.ts
import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from "@solana/spl-token";
import {
  SOLANA_CONNECTION,
  MASTER_KEYPAIR,
  TOKEN_ACCOUNT_PUBLICKEY,
  TOKEN_CREATOR_PUBLICKEY,
  MASTER_PUBLICKEY,
} from "../../config";

export async function sendToken(
  _destination: PublicKey,
  _token: PublicKey,
  _amount: number = 1,
  _decimals: number = 0
) {
  const signTransaction = "processed";
  const amount = _amount * Math.pow(10, _decimals);
  try {
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      SOLANA_CONNECTION,
      MASTER_KEYPAIR,
      _token,
      _destination,
      true,
      signTransaction
    );
    const tx = new Transaction().add(
      createTransferInstruction(
        TOKEN_ACCOUNT_PUBLICKEY,
        toTokenAccount.address,
        TOKEN_CREATOR_PUBLICKEY,
        amount,
        [MASTER_KEYPAIR],
        TOKEN_PROGRAM_ID
      )
    );
    const blockHash = await SOLANA_CONNECTION.getLatestBlockhash();
    tx.feePayer = MASTER_PUBLICKEY;
    tx.recentBlockhash = blockHash.blockhash;
    const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION, tx, [
      MASTER_KEYPAIR,
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
