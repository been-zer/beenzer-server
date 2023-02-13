import { SOLANA_CONNECTION, TOKEN_PUBLICKEY } from "../../config";

export async function getTokenAccounts(wallet: string) {
  const accounts = await SOLANA_CONNECTION.getProgramAccounts(
    TOKEN_PUBLICKEY //new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
  );
  console.log(
    `Found ${accounts.length} token account(s) for wallet ${wallet}.`
  );
  accounts.forEach((account, i) => {
    //Parse the account data
    const parsedAccountInfo: any = account.account.data;
    const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
    const tokenBalance: number =
      parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
    //Log results
    console.log(`Token Account No. ${i + 1}: ${account.pubkey.toString()}`);
    console.log(`--Token Mint: ${mintAddress}`);
    console.log(`--Token Balance: ${tokenBalance}`);
  });
}
