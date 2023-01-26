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

export async function printNFTCopy(
  originalNFT: PublicKey,
  newOwner: PublicKey
): Promise<any> {
  try {
    const nftMaster = await METAPLEX.nfts().findByMint({
      mintAddress: originalNFT,
      loadJsonMetadata: true,
    });
    console.log(nftMaster);
    // console.log(nftMaster.edition);
    const nftCopy = await METAPLEX.nfts().printNewEdition({
      originalMint: originalNFT,
      newOwner: newOwner,
    });
    return nftCopy;
  } catch (err) {
    if (String(err).includes("max supply")) {
      const msg = "Trying to print a full supply NFT!";
      console.log(msg);
      return msg;
    }
    console.log(err);
    return String(err);
  }
}

printNFTCopy(
  new PublicKey("CKStFujy6es6CmSAcXVYu2Ujny1iseD2mFRjpWABXtZ2"),
  new PublicKey("3o7UynEE8fwboPydXEvU2xTuB1n9xXLgcCMw3FuzrH7A")
);
