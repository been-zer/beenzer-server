/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import {
  Metaplex,
  CreateNftOutput,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  toBigNumber,
} from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import { getDate, getTime, sleep } from "../utils";
import { videoToGif } from "./videoToGif";
import {
  SOLANA_CONNECTION,
  SOLANA_RPC_URL,
  MASTER_COLLECTION,
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

export async function uploadAsset(
  data: any,
  fileName: string,
  _tries: number = 10
): Promise<string> {
  console.log(`Step 1 - Uploading Asset to Arweave...`);
  let i = 0;
  while (i < _tries) {
    try {
      const assetBuffer = Buffer.from(data, "utf8");
      const assetMetaplexFile = toMetaplexFile(assetBuffer, fileName);
      const assetUri = await METAPLEX.storage().upload(assetMetaplexFile);
      console.log("Asset url:", assetUri);
      if (assetUri === "ERROR") {
        console.log("Uploading asset failed.");
        continue;
      }
      return assetUri;
    } catch (err) {
      if (String(err).includes("funds")) {
        console.log("Not enough funds in the master wallet!!!");
      }
      console.log(err);
      sleep(3000);
      i++;
    }
  }
  return "ERROR";
}

export async function uploadImage(
  data: any,
  fileName: string,
  _tries: number = 10
): Promise<string> {
  console.log(`Step 1 - Uploading Image to Arweave...`);
  let i = 0;
  while (i < _tries) {
    try {
      const imgBuffer = Buffer.from(data, "utf8");
      const imgMetaplexFile = toMetaplexFile(imgBuffer, fileName);
      const imgUri = await METAPLEX.storage().upload(imgMetaplexFile);
      console.log("Image url:", imgUri);
      if (imgUri === "ERROR") {
        console.log("Uploading image failed.");
        continue;
      }
      return imgUri;
    } catch (err) {
      if (String(err).includes("funds")) {
        console.log("Not enough funds in the master wallet!!!");
      }
      console.log(err);
      sleep(3000);
      i++;
    }
  }
  return "ERROR";
}

export async function uploadMetadata(
  imageUri: string,
  assetUri: string,
  assetType: string,
  symbol: string,
  nftName: string,
  description: string,
  attributes: { trait_type: string; value: string }[],
  _tries: number = 10
): Promise<string> {
  console.log(`Step 2 - Uploading Metadata to Arweave...`);
  let i = 0;
  while (i < _tries) {
    try {
      const { uri } = await METAPLEX.nfts().uploadMetadata({
        name: nftName,
        description: description,
        image: imageUri || assetType,
        symbol: symbol,
        attributes: attributes,
        properties: {
          files: [
            {
              type: assetType,
              uri: assetUri,
              cdn: true,
            },
          ],
        },
      });
      console.log("Metadata url:", uri);
      if (uri === "ERROR") {
        console.log("Uploading metadata failed.");
        continue;
      }
      return uri;
    } catch (err) {
      if (String(err).includes("funds")) {
        console.log("Not enough funds in the master wallet!!!");
      }
      console.log(err);
      sleep(3000);
      i++;
    }
  }
  return "ERROR";
}

export async function mintToken(
  metadataUri: string,
  name: string,
  supply: number,
  sellerFee: number,
  symbol: string,
  creators: { address: PublicKey; share: number }[],
  _tries: number = 10
): Promise<PublicKey | string> {
  console.log(`Step 3 - Minting ${name} in Solana...`);
  let nft: CreateNftOutput;
  let i = 0;
  while (i < _tries) {
    try {
      nft = await METAPLEX.nfts().create({
        uri: metadataUri,
        name: name,
        sellerFeeBasisPoints: sellerFee,
        symbol: symbol,
        creators: creators,
        isMutable: false,
        maxSupply: toBigNumber(supply),
      });
      console.log(`⛏️  Mint Success! Tries: ${i + 1}`);
      console.log(
        `   Minted NFT: https://solscan.io/token/${nft.mintAddress.toBase58()}?cluster=mainnet-beta`
      );
      i = 10;
      return nft.mintAddress;
    } catch (err) {
      console.log(`Minting NFT failed!!! ${i + 1}`);
      sleep(5000);
      i++;
    }
  }
  return "ERROR";
}

async function mintNFT(
  id: number,
  asset: Buffer,
  symbol: string,
  type: string,
  supply: number,
  creator: string,
  username: string,
  description: string,
  city: string,
  latitude: number,
  longitude: number,
  distance: string,
  maxLat: number,
  minLat: number,
  maxLon: number,
  minLon: number,
  _nftImage: Buffer, // Optional
  _collection: PublicKey = MASTER_COLLECTION, // Optional
  _tries: number = 10 // Optional
): Promise<any> {
  const nftName = async () => {
    if (id > 0) {
      return `${symbol} #${Number(id)}` as string;
    } else {
      console.log("ERROR: NFT id wrong!!!");
      return "ERROR";
    }
  };
  const date = getDate();
  const year = date.slice(0, 4);
  const time = getTime();
  const METADATA = {
    nftType: type,
    nftTitle: await nftName(),
    description: description,
    attributes: [
      { trait_type: "CREATOR", value: creator },
      { trait_type: "USERNAME", value: username },
      { trait_type: "TYPE", value: type },
      { trait_type: "SUPPLY", value: String(supply) },
      { trait_type: "DATE", value: date },
      { trait_type: "TIME UTC", value: time },
      { trait_type: "CITY", value: city },
      { trait_type: "LATITUDE", value: String(latitude) },
      { trait_type: "LONGITUDE", value: String(longitude) },
      { trait_type: "VISIBILITY", value: distance },
      { trait_type: "MAX LAT", value: String(maxLat) },
      { trait_type: "MIN LAT", value: String(minLat) },
      { trait_type: "MAX LON", value: String(maxLon) },
      { trait_type: "MIN LON", value: String(minLon) },
    ],
    sellerFeeBasisPoints: 1000, // 1000 bp = 10% royalties
    symbol: symbol,
    edition: `${symbol} ${year}`,
    collection: _collection,
    maxSupply: supply,
    isCollection: true,
    isMutabe: false,
    creators: [
      { address: new PublicKey(creator), share: 80 },
      { address: MASTER_KEYPAIR.publicKey, share: 20 },
    ],
  };
  if (asset) {
    // Step 1 - Upload media
    const assetUri = await uploadAsset(
      asset,
      `${METADATA.nftTitle}.${type.split("/")[1]}`,
      _tries
    );
    let imageUri = assetUri;
    if (type.split("/")[0] === "video") {
      const gif = await videoToGif(asset, 3, 10);
      imageUri = await uploadImage(gif, METADATA.nftTitle + ".gif", _tries);
    } else if (type.split("/")[0] === "audio") {
      imageUri = await uploadImage(
        _nftImage,
        METADATA.nftTitle + ".png",
        _tries
      );
    }
    if (assetUri && imageUri && assetUri !== "ERROR" && imageUri !== "ERROR") {
      // Step 2 - Upload metadata
      const metadataUri = await uploadMetadata(
        imageUri,
        assetUri,
        METADATA.nftType,
        METADATA.symbol,
        METADATA.nftTitle,
        METADATA.description,
        METADATA.attributes,
        _tries
      );
      if (metadataUri && metadataUri !== "ERROR") {
        // Step 3 - Mint Master Edition
        let token = await mintToken(
          metadataUri,
          METADATA.nftTitle,
          METADATA.maxSupply,
          METADATA.sellerFeeBasisPoints,
          METADATA.symbol,
          METADATA.creators,
          _tries
        );
        if (token && token !== "ERROR") {
          // token.imageURL = imageUri;
          return token;
        }
      }
    }
  }
  return "ERROR";
}

export default mintNFT;
