import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import {
  SOLANA_CONNECTION,
  SOLANA_RPC_URL,
  MASTER_KEYPAIR,
  METAPLEX_BUNDLR_URI,
} from "./solanaConnection";

const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
  .use(keypairIdentity(MASTER_KEYPAIR))
  .use(
    bundlrStorage({
      address: METAPLEX_BUNDLR_URI,
      providerUrl: SOLANA_RPC_URL,
      timeout: 360000,
    })
  );

export async function printNFTCopy(originalNFT: PublicKey): Promise<any> {
  const nftCopy = await METAPLEX.nfts().printNewEdition({
    originalMint: originalNFT,
  });
  console.log(nftCopy);
  return nftCopy;
}
