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
import { sendNFT } from "./sendNFT";
import {
  SOLANA_CONNECTION,
  SOLANA_RPC_URL,
  MASTER_KEYPAIR,
  METAPLEX_BUNDLR_URI,
  MARKETPLACE_PUBKEY,
} from "../solanaConnection";
import { NFT } from "./getUserNFTs";

const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
  .use(keypairIdentity(MASTER_KEYPAIR))
  .use(
    bundlrStorage({
      address: METAPLEX_BUNDLR_URI,
      providerUrl: SOLANA_RPC_URL,
      timeout: 360000,
    })
  );

async function printNFT(
  originalNFT: PublicKey,
  destination: PublicKey,
  _tries: number = 10, // Optional
  _returnEdition: boolean = false, // Optional
  _whenMaxSupply = "SEND", // or BURN Master Edition
  _destinationWallet = MARKETPLACE_PUBKEY, // if SEND, destination wallet pubkey
  _errLogs: boolean = false // Optional. Print Error logs
): Promise<NFT | number | boolean> {
  let i = 0;
  while (i < _tries) {
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
        console.log(
          "Master Edition NFT doesn't found! Probably is already burned."
        );
        return false;
      }
      if (!freeSupply) {
        console.log(
          "Trying to print a 0 free supply NFT! 🔥 Burning master editon NFT!"
        );
        if (_whenMaxSupply === "BURN") {
          if (await burnNFT(originalNFT)) {
            return true;
          }
        } else if (_whenMaxSupply === "SEND") {
          if (
            await sendNFT(_destinationWallet, originalNFT.toBase58(), 1, _tries)
          ) {
            return true;
          }
        } else {
          console.log(
            "❌ - ERROR: Unknown _whenMaxSupply value! Please, leave it empty for default value - SEND, or insert BURN to burn the Master Edition when last print operation is done."
          );
          return false;
        }
      }
      const edition = Number(supply) + 1;
      console.log(
        `🖨️ Printing new NFT edition from ${originalNFT.toBase58()}...`,
        `Current supply ${edition} from maxSupply ${maxSupply}`
      );
      const nftCopy: PrintNewEditionOutput =
        await METAPLEX.nfts().printNewEdition({
          originalMint: originalNFT,
          newOwner: destination,
        });
      if (nftCopy) {
        nftMaster.edition = edition;
        if (freeSupply === 1) {
          if (_whenMaxSupply === "BURN") {
            await burnNFT(originalNFT);
          } else if (_whenMaxSupply === "SEND") {
            await sendNFT(
              _destinationWallet,
              originalNFT.toBase58(),
              1,
              _tries
            );
          } else {
            console.log(
              "❌ - ERROR: Unknown _whenMaxSupply value! Please, leave it empty for default value - SEND, or insert BURN to burn the Master Edition when last print operation is done."
            );
            return false;
          }
        }
        console.log(
          "✅ Succefully printed new NFT edition!",
          `Tries: ${i + 1}`
        );
        if (_returnEdition) {
          return edition;
        }
        return nftMaster;
      }
    } catch (err) {
      if (String(err).includes("max supply")) {
        console.log("Trying to print a full supply NFT!");
        return false;
      }
      if (_errLogs) {
        console.log("\nERROR:\n", err);
      }
      i++;
      console.log(
        `❌ - Printing failed for unkown reason! Check logs. Tries: ${i}`
      );
    }
  }
  return false;
}

export default printNFT;
