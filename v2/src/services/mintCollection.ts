import { PublicKey } from "@solana/web3.js";
import { MASTER_PUBLICKEY } from "./solanaConnection";
import { uploadImage, uploadMetadata, mintToken } from "./mintNFT";
import fs from "fs";

const imageBuffer = fs.readFileSync("src/assets/logo.png");

export async function mintCollection(
  buffer: Buffer = imageBuffer,
  name: string = "BEENZER COLLECTION",
  symbol: string = "BEENZER",
  website: string = "https://beenzer.app",
  dao: string = "https://dao.beenzer.app",
  market: string = "https://market.beenzer.app",
  description: string = "Beenzer Collection is the NFT Master for BEENZER #♾️ verified collection. Check our links to be part of the best web3 community! 💚",
  twitter: string = "https://twitter.com/beenzer_app",
  instagram: string = "https://instagram.com/beenzer_app",
  discord: string = "https://discord.gg/Ta9X6zbg",
  telegram: string = "https://t.me/+VgZorKQGP0gwY2Fk",
  tiktok: string = "https://tiktok.com/beenzer_app",
  youtube: string = "https://youtube.com/@beenzer",
  creators: { address: PublicKey; share: number }[] = [
    { address: MASTER_PUBLICKEY, share: 100 },
  ],
  _tries: number = 10
): Promise<PublicKey | string | boolean> {
  let i = 0;
  while (i < _tries) {
    try {
      const imageUri = await uploadImage(buffer, name + ".png", _tries);
      const attributes = [
        { trait_type: "WEBSITE", value: website },
        { trait_type: "DAO", value: dao },
        { trait_type: "MARKET", value: market },
        { trait_type: "TWITTER", value: twitter },
        { trait_type: "INSTAGRAM", value: instagram },
        { trait_type: "DISCORD", value: discord },
        { trait_type: "TELEGRAM", value: telegram },
        { trait_type: "TIKTOK", value: tiktok },
        { trait_type: "YOUTUBE", value: youtube },
      ];
      const metadataUri = await uploadMetadata(
        imageUri,
        imageUri,
        "image/png",
        symbol,
        name,
        description,
        attributes,
        _tries
      );
      const token = await mintToken(
        metadataUri,
        name,
        0,
        0,
        symbol,
        creators,
        _tries
      );
      return token;
    } catch (err) {
      console.log(err);
      i++;
    }
  }
  return false;
}

mintCollection();
