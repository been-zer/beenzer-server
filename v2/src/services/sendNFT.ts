import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from "@solana/spl-token";
import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  SOLANA_CONNECTION,
  MASTER_KEYPAIR,
  MASTER_PUBLICKEY,
} from "./solanaConnection";
import { sleep } from "../utils";

export async function sendNFT(
  destination: string,
  token: string,
  supply: number,
  _tries: number = 10
) {
  console.log(`Sending ${supply} ${token.toString()} to ${destination}...`);
  if (destination && token && supply) {
    //Step 1
    console.log(`1 - Getting Source Token Account`);
    let sourceAccount: any;
    let i = 0;
    while (i < _tries) {
      try {
        sourceAccount = await getOrCreateAssociatedTokenAccount(
          SOLANA_CONNECTION,
          MASTER_KEYPAIR,
          new PublicKey(token),
          MASTER_PUBLICKEY
        );
        console.log(
          `    Source Account: ${sourceAccount.address.toString()}`,
          `Tries: ${i + 1}`
        );
        i = _tries;
        break;
      } catch (error) {
        console.log(error);
        sleep(1000);
        i++;
      }
    }
    if (sourceAccount) {
      //Step 2
      console.log(`2 - Getting Destination Token Account`);
      let destinationAccount: any;
      let j = 0;
      while (j < _tries) {
        try {
          destinationAccount = await getOrCreateAssociatedTokenAccount(
            SOLANA_CONNECTION,
            MASTER_KEYPAIR,
            new PublicKey(token),
            new PublicKey(destination)
          );
          console.log(
            `    Destination Account: ${destinationAccount.address.toString()}`,
            `Tries: ${j + 1}`
          );
          j = _tries;
          break;
        } catch (error) {
          console.log(error);
          sleep(1000);
          j++;
        }
      }
      if (destinationAccount) {
        //Step 3
        console.log(`3 - Creating and Sending Transaction`);
        let k = 0;
        while (k < _tries) {
          try {
            const tx = new Transaction();
            tx.add(
              createTransferInstruction(
                sourceAccount.address,
                destinationAccount.address,
                MASTER_PUBLICKEY,
                Math.floor(supply)
              )
            );
            const latestBlockHash = await SOLANA_CONNECTION.getLatestBlockhash(
              "confirmed"
            );
            tx.recentBlockhash = latestBlockHash.blockhash;
            const signature = await sendAndConfirmTransaction(
              SOLANA_CONNECTION,
              tx,
              [MASTER_KEYPAIR]
            );
            console.log(
              "\x1b[32m", //Green Text
              `   🚀 Transaction Success! Tries: ${k + 1}`,
              `\n    https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`
            );
            if (signature) {
              return true;
            }
          } catch (error) {
            console.log(error);
            sleep(3000);
            k++;
          }
        }
      }
    }
  } else {
    console.log("ERROR: Invalid inputs in sendNFT.ts!!!");
  }
  return false;
}
