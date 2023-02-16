import { PublicKey } from "@solana/web3.js";
import {
  SYMBOL,
  MASTER_PUBLICKEY,
  NFT_MASTER_SUPPLY,
  LANDING_URL,
  MARKET_URL,
  DAO_URL,
  DESCRIPTION,
  TWITTER,
  INSTAGRAM,
  DISCORD,
  TELEGRAM,
  TIKTOK,
  YOUTUBE,
  OPENSEA,
  MAGICEDEN,
} from "../../config";
import { uploadImage, uploadMetadata, mintMaster } from "./mintNFT";
import fs from "fs";

const imageBuffer = fs.readFileSync("./src/assets/logo.png");

export async function mintCollection(
  buffer: Buffer = imageBuffer,
  name: string = `${SYMBOL} COLLECTION`,
  symbol: string = SYMBOL,
  supply: number = NFT_MASTER_SUPPLY,
  sellerFee: number = 0,
  mutable: boolean = false,
  website: string = LANDING_URL,
  dao: string = DAO_URL,
  market: string = MARKET_URL,
  description: string = DESCRIPTION,
  twitter: string = TWITTER,
  instagram: string = INSTAGRAM,
  discord: string = DISCORD,
  telegram: string = TELEGRAM,
  tiktok: string = TIKTOK,
  youtube: string = YOUTUBE,
  opensea: string = OPENSEA,
  magiceden: string = MAGICEDEN,
  creators: { address: PublicKey; share: number }[] = [
    { address: MASTER_PUBLICKEY, share: 100 },
  ],
  tries: number = 10
): Promise<PublicKey | string | boolean> {
  let i = 0;
  while (i < tries) {
    try {
      const imageUri = await uploadImage(buffer, name + ".png", tries);
      const attributes = [
        { trait_type: "SUUPLY", value: String(supply) },
        { trait_type: "MUTABLE", value: mutable ? "TRUE" : "FALSE" },
        { trait_type: "WEBSITE", value: website },
        { trait_type: "DAO", value: dao },
        { trait_type: "MARKET", value: market },
        { trait_type: "TWITTER", value: twitter },
        { trait_type: "INSTAGRAM", value: instagram },
        { trait_type: "DISCORD", value: discord },
        { trait_type: "TELEGRAM", value: telegram },
        { trait_type: "TIKTOK", value: tiktok },
        { trait_type: "YOUTUBE", value: youtube },
        { trait_type: "OPENSEA", value: opensea },
        { trait_type: "MAGICEDEN", value: magiceden },
      ];
      const metadataUri = await uploadMetadata(
        imageUri,
        imageUri,
        "image/png",
        symbol,
        name,
        description,
        attributes,
        tries
      );
      const token = await mintMaster(
        metadataUri,
        name,
        supply,
        sellerFee,
        symbol,
        creators,
        mutable,
        tries
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
