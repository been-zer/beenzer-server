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
  TOKEN_PUBLICKEY,
  TOKEN_ACCOUNT_PUBLICKEY,
  TOKEN_CREATOR,
} from "../../config";

export const sendToken = async (
  _pubkey: string,
  _amount: number = 1,
  _decimals: number = 2
) => {
  const destinationAccount = new PublicKey(_pubkey);
  const signTransaction = "processed";
  const amount = _amount * Math.pow(10, _decimals);
  try {
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      SOLANA_CONNECTION,
      MASTER_KEYPAIR,
      TOKEN_PUBLICKEY,
      destinationAccount,
      true,
      signTransaction
    );
    const tx = new Transaction().add(
      createTransferInstruction(
        TOKEN_ACCOUNT_PUBLICKEY, // source
        toTokenAccount.address, // dest
        new PublicKey(TOKEN_CREATOR),
        amount,
        [MASTER_KEYPAIR],
        TOKEN_PROGRAM_ID
      )
    );
    const blockHash = await SOLANA_CONNECTION.getLatestBlockhash();
    tx.feePayer = MASTER_KEYPAIR.publicKey;
    tx.recentBlockhash = blockHash.blockhash;
    const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION, tx, [
      MASTER_KEYPAIR,
    ]);
    console.log(
      "\x1b[32m", // Green Text
      `   Transaction Success! 🎉  Sent ${_amount} BEEN to ${_pubkey}`,
      `\n    https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`
    );
  } catch (err) {
    console.log(err);
  }
};

// v 1.0
