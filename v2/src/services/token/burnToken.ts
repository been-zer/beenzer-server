import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { SOLANA_CONNECTION, MASTER_KEYPAIR } from "../solanaConnection";

export async function burnToken(
  token: PublicKey,
  _quantity: number = 1,
  _decimals: number = 2,
  _tries: number = 10
): Promise<boolean> {
  let i = 0;
  while (i < _tries) {
    try {
      const account = await getAssociatedTokenAddress(
        token,
        MASTER_KEYPAIR.publicKey
      );
      // Step 1 - Create Burn Instructions
      console.log(`Step 1 - Creating Burn Instructions...`);
      const burnIx = createBurnCheckedInstruction(
        account, // PublicKey of Owner's Associated Token Account
        token, // Public Key of the Token Mint Address
        MASTER_KEYPAIR.publicKey, // Public Key of Owner's Wallet
        _quantity * 10 ** _decimals, // Number of tokens to burn
        _decimals // Number of Decimals of the Token Mint
      );
      console.log(`✅ - Burn instruction created!`);
      console.log(`Step 2 - Creating Transaction Instructions...`);
      const { blockhash, lastValidBlockHeight } =
        await SOLANA_CONNECTION.getLatestBlockhash("finalized");
      const messageV0 = new TransactionMessage({
        payerKey: MASTER_KEYPAIR.publicKey,
        recentBlockhash: blockhash,
        instructions: [burnIx],
      }).compileToV0Message();
      const transaction = new VersionedTransaction(messageV0);
      transaction.sign([MASTER_KEYPAIR]);
      console.log(`✅ - Transaction instructions created!`);
      console.log(`Step 3 - Signing & Executing Transaction...`);
      const txid = await SOLANA_CONNECTION.sendTransaction(transaction);
      console.log("✅ - Transaction sent to network. Waiting for answer...");
      const confirmation = await SOLANA_CONNECTION.confirmTransaction({
        signature: txid,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
      });
      if (confirmation.value.err) {
        throw new Error("❌ - Transaction not confirmed.");
      }
      console.log(
        "🔥 TOKEN BURNED!🔥",
        `Tries: ${i + 1}`,
        "\n",
        `https://solscan.io/${txid}?cluster=mainnet`
      );
      return true;
    } catch (err) {
      console.log(err);
      i++;
    }
  }
  return false;
}
