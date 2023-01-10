import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { Socket } from 'socket.io';
import dotenv from 'dotenv';
import { sleep } from "../utils";
dotenv.config();

const secret = String(process.env.MASTER_WALLET_KEYPAIR).split(',') as any;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL as string;
const SOLANA_CONNECTION = new Connection(SOLANA_RPC_URL);
const WALLET = Keypair.fromSecretKey(new Uint8Array(secret));

export async function sendNFT( socket: Socket, destination: string, token: PublicKey, supply: number ) {
​
  socket.emit('mintLogs', `Sending ${supply} ${(token.toString())} from ${(WALLET.publicKey.toString())} to ${(destination)}.`);
  console.log(`Sending ${supply} ${(token.toString())} from ${(WALLET.publicKey.toString())} to ${(destination)}.`)
  
  //Step 1
  console.log(`1 - Getting Source Token Account`);
  let sourceAccount: any;
  let i = 0;
  while ( i < 10 ) {
    try {
      sourceAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION, 
        WALLET,
        token,
        WALLET.publicKey
      );
      console.log(`    Source Account: ${sourceAccount.address.toString()}`);
      break;
    } catch (error) {
      console.log(error);
      sleep(3000);
      i++;
    }
  }

  //Step 2
  console.log(`2 - Getting Destination Token Account`);
  let destinationAccount: any;
  let j = 0;
  while ( j < 10 ) {
    try {
      destinationAccount = await getOrCreateAssociatedTokenAccount(
      SOLANA_CONNECTION, 
      WALLET,
      new PublicKey(token),
      new PublicKey(destination)
      );
      console.log(`    Destination Account: ${destinationAccount.address.toString()}`);
      break;
    } catch (error) {
      console.log(error);
      sleep(3000);
      j++;
    }
  }
​
  //Step 3
  console.log(`3 - Fetching Number of Decimals for Mint: ${token}`);
  const numberDecimals = 0;// await getNumberDecimals(MINT_ADDRESS);
  // console.log(`    Number of Decimals: ${numberDecimals}`);
​
  //Step 4
  console.log(`4 - Creating and Sending Transaction`);
  
  let k = 0;
  while ( k < 10 ) {
    try {
      const tx = new Transaction();
      tx.add(createTransferInstruction(
          sourceAccount.address,
          destinationAccount.address,
          WALLET.publicKey,
          supply * Math.pow(10, numberDecimals)
      ))
      const latestBlockHash = await SOLANA_CONNECTION.getLatestBlockhash('confirmed');
      tx.recentBlockhash = latestBlockHash.blockhash;    
      const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION,tx,[WALLET]);
      socket.emit('mintLogs', `Transaction Success! 🎉 \n https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`);
      console.log(
          '\x1b[32m', //Green Text
          `   Transaction Success! 🎉`,
          `\n    https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`
      );
      k = 10;
      break;
    } catch (error) {
      console.log(error);
      sleep(3000);
      k++;
    }
  }

  return true;
  
}
