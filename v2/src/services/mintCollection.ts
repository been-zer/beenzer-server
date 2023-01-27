import fs from "fs";
import { uploadImage, uploadMetadata } from "./mintNFT";

export async function mintCollection(
  name: string,
  symbol: string,
  website: string,
  dao: string,
  market: string,
  description: string,
  twitter: string,
  instagram: string,
  discord: string,
  telegram: string,
  tiktok: string,
  youtube: string,
  magiceden: string,
  opensea: string,
  _tries: number = 10
): Promise<boolean> {
  let i = 0;
  while (i < _tries) {
    try {
      const imageBuffer = fs.readFileSync("../assets/logo.png");
      const imageUri = await uploadImage(imageBuffer, name + ".png", _tries);
      const attributes = [
        { trait_type: "WEBSITE", value: website },
        { trait_type: "DAO_APP", value: dao },
        { trait_type: "MARKET", value: market },
        { trait_type: "TWITTER", value: twitter },
        { trait_type: "INSTAGRAM", value: instagram },
        { trait_type: "DISCORD", value: discord },
        { trait_type: "TELEGRAM", value: telegram },
        { trait_type: "TIKTOK", value: tiktok },
        { trait_type: "YOUTUBE", value: youtube },
        { trait_type: "MAGIC_EDEN", value: magiceden },
        { trait_type: "OPEN_SEA", value: opensea },
      ];
      const metadataUri = await uploadMetadata(
        imageUri,
        imageUri,
        "image/png",
        symbol,
        name,
        description,
        {}
      );

      console.log(token);
      return true;
    } catch (err) {
      console.log(err);
      i++;
    }
  }
  return false;
}
