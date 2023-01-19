import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as http from "http";
// import fetch from "node-fetch";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL as string;
const SOLANA_CONNECTION = new Connection(SOLANA_RPC_URL as string);

export interface NFT {
  token: string;
  mint: string;
  symbol: string;
  supply: number;
  royalty: number;
  creators: Creator[];
  name: string;
  description: string;
  asset_uri: string;
  metadata: Trait[];
}
interface Creator {
  pubkey: string;
  share: number;
}
interface Trait {
  name: string;
  value: string;
}

export const getUserNFTs = async (
  _pubkey: string, // public key to get NFTs from.
  _solanaConnection: Connection = SOLANA_CONNECTION,
  _keypair: Keypair = Keypair.generate()
): Promise<NFT[]> => {
  const metaplex = new Metaplex(_solanaConnection);
  metaplex.use(keypairIdentity(_keypair));
  const owner = new PublicKey(_pubkey);
  const rawNFTs = (await metaplex
    .nfts()
    .findAllByOwner({ owner })) as Array<any>;
  const NFTs: NFT[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const rawNFT of rawNFTs) {
    const req = http.get(rawNFT.uri as string, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", async () => {
        const metadata = JSON.parse(data);
        const mint = rawNFT.mintAddress.toBase58();
        const supply = await _solanaConnection.getTokenSupply(
          new PublicKey(mint)
        );
        const nftRow = {
          token: rawNFT.address.toBase58() as string,
          mint: mint as string,
          symbol: rawNFT.symbol as string,
          supply: supply.value.uiAmount as number,
          royalty: rawNFT.sellerFeeBasisPoints as number, // base 100 ex: 1000 = 10%
          creators: rawNFT.creators.map(
            (x: { address: string; share: number }) => {
              return { pubkey: x.address, share: x.share };
            }
          ) as Creator[],
          name: metadata.name as string,
          description: metadata.description as string,
          asset_uri: metadata.image as string,
          metadata: metadata.attributes.map(
            (x: { trait_type: string; value: number }) => {
              return { type: x.trait_type, value: x.value };
            }
          ) as Trait[],
        };
        NFTs.push(nftRow as NFT);
      });
    });
    req.on("error", (error) => {
      console.error(error);
    });
  }
  return NFTs;
};
