import request from "request";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SOLANA_CONNECTION } from "../../config";

export interface Creator {
  pubkey: string;
  share: number;
}
export interface Trait {
  name: string;
  value: string;
}
export interface NFT {
  token: string;
  account: string;
  symbol: string;
  amount: number;
  supply: number;
  royalty: number;
  creators: Creator[];
  name: string;
  description: string;
  image_uri: string;
  asset_uri: string;
  attributes: Trait[];
}
export const getWalletNFTs = async (
  pubkey: string,
  _solanaConnection: Connection = SOLANA_CONNECTION,
  _keypair: Keypair = Keypair.generate()
): Promise<NFT[]> => {
  const metaplex = new Metaplex(_solanaConnection);
  metaplex.use(keypairIdentity(_keypair));
  const owner = new PublicKey(pubkey);
  const rawNFTs = (await metaplex
    .nfts()
    .findAllByOwner({ owner })) as Array<any>;
  const NFTs: NFT[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const rawNFT of rawNFTs) {
    let metadata: any;
    await new Promise((resolve, reject) => {
      request(rawNFT.uri as string, (error: any, response: any, body: any) => {
        if (error) reject(error);
        else {
          metadata = JSON.parse(body);
          resolve(metadata);
        }
      });
    });
    const mint = rawNFT.mintAddress.toBase58();
    const addr = rawNFT.address.toBase58();
    console.log("\neo", mint, addr);
    const supply = await _solanaConnection.getTokenSupply(new PublicKey(mint));
    const nftRow = {
      token: mint as string,
      account: addr as string,
      symbol: rawNFT.symbol as string,
      amount: 1,
      supply: supply.value.uiAmount as number,
      royalty: rawNFT.sellerFeeBasisPoints as number, // base 100 ex: 1000 = 10%
      creators: rawNFT.creators.map((x: { address: string; share: number }) => {
        return { pubkey: x.address, share: x.share };
      }) as Creator[],
      name: metadata.name as string,
      description: metadata.description as string,
      image_uri: metadata.image as string,
      asset_uri: metadata.properties.files.uri as string,
      type: metadata.properties.files.type as string,
      attributes: metadata.attributes.map(
        (x: { trait_type: string; value: number }) => {
          return { type: x.trait_type, value: x.value };
        }
      ) as Trait[],
    };
    NFTs.push(nftRow as NFT);
  }
  return NFTs;
};
