import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SOLANA_CONNECTION, TOKEN } from "../../config";

export const getTokenHolders = async (_token: string = TOKEN) => {
  const accounts = await SOLANA_CONNECTION.getProgramAccounts(
    TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      dataSlice: {
        offset: 0, // number of bytes
        length: 0, // number of bytes
      },
      filters: [
        {
          dataSize: 165, // number of bytes
        },
        {
          memcmp: {
            offset: 0, // number of bytes
            bytes: _token, // base58 encoded string
          },
        },
      ],
    }
  );
  console.log(`Found ${accounts.length} BEEN account(s) for mint ${_token}`);
  return accounts;
};
