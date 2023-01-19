import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getNFTsByTokens } from "../controllers/nfts.controller";
import request from "request";

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
  _pubkey: string,
  _solanaConnection: Connection = SOLANA_CONNECTION,
  _keypair: Keypair = Keypair.generate()
): Promise<Array<any>> => {
  const solanaNFTs = await getUserNFTsSolana(
    _pubkey,
    _solanaConnection,
    _keypair
  );
  let tokens = "";
  if (solanaNFTs.length === 1) {
    tokens = `'${solanaNFTs[0].token}'`;
  } else if (solanaNFTs.length > 1) {
    for (const nft of solanaNFTs) {
      tokens += `'${nft.token}', `;
    }
    tokens = tokens.slice(0, -2);
  }
  return await getNFTsByTokens(tokens);
};

export const getUserNFTsSolana = async (
  _pubkey: string,
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
    const supply = await _solanaConnection.getTokenSupply(new PublicKey(mint));
    const nftRow = {
      token: rawNFT.address.toBase58() as string,
      mint: mint as string,
      symbol: rawNFT.symbol as string,
      supply: supply.value.uiAmount as number,
      royalty: rawNFT.sellerFeeBasisPoints as number, // base 100 ex: 1000 = 10%
      creators: rawNFT.creators.map((x: { address: string; share: number }) => {
        return { pubkey: x.address, share: x.share };
      }) as Creator[],
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
  }
  return NFTs;
};
