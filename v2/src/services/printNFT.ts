import {
  Nft,
  Sft,
  Metaplex,
  bundlrStorage,
  keypairIdentity,
  PrintNewEditionOutput,
} from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import { burnNFT } from "./burnNFT";
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

export async function printNFT(
  originalNFT: PublicKey,
  destination: PublicKey
): Promise<PrintNewEditionOutput | boolean | string> {
  try {
    const nftMaster: Nft | Sft | any = await METAPLEX.nfts().findByMint({
      mintAddress: originalNFT,
      loadJsonMetadata: true,
    });
    let supply: number;
    let maxSupply: number;
    let freeSupply = 0;
    if (nftMaster) {
      supply = Number(nftMaster.edition.supply);
      maxSupply = Number(nftMaster.edition.maxSupply);
      freeSupply = maxSupply - supply;
    } else {
      const msg =
        "Master Edition NFT doesn't found! Probably is already burned.";
      console.log(msg);
      return msg;
    }
    if (!freeSupply) {
      console.log(
        "Trying to print a 0 free supply NFT! 🔥 Burning master editon NFT!"
      );
      if (await burnNFT(originalNFT)) {
        return true;
      } else {
        return false;
      }
    }
    console.log(
      `🖨️ Printing new NFT edition from ${originalNFT.toBase58()}...`,
      `Current supply ${supply + 1} from maxSupply ${maxSupply}`
    );
    const nftCopy: PrintNewEditionOutput =
      await METAPLEX.nfts().printNewEdition({
        originalMint: originalNFT,
        newOwner: destination,
      });
    if (nftCopy) {
      if (freeSupply === 1) {
        burnNFT(originalNFT);
      }
      return nftCopy;
    } else {
      console.log("❌ - Printing failed for unkown reason! Check logs.");
      return false;
    }
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

// printNFT(
//   new PublicKey("E63AdnWPKJcF2fdTvp1yz74KQ3z7NWAvMCjM5n7MJXB6"),
//   new PublicKey("3o7UynEE8fwboPydXEvU2xTuB1n9xXLgcCMw3FuzrH7A")
// );
