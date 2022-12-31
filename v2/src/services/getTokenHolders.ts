import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection } from "@solana/web3.js";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL as string;
const TOKEN = process.env.TOKEN as string;
const SOLANA_CONNECTION = new Connection(SOLANA_RPC_URL);

export const getTokenHolders = async ( _token: string = TOKEN ) => {
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
  console.log(
    `Found ${accounts.length} token account(s) for mint ${_token}`
  );
  console.log(accounts);
};
