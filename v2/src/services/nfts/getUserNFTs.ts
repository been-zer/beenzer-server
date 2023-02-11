import request from "request";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  getNFTsByTokens,
  getEditionsByOwner,
} from "../../controllers/nfts.controller";
import { SOLANA_CONNECTION } from "../solanaConnection";

export interface NFT {
  token: string;
  mint: string;
  symbol: string;
  amount: number;
  supply: number;
  royalty: number;
  creators: Creator[];
  name: string;
  description: string;
  image_uri: string;
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
  pubkey: string,
  _solanaConnection: Connection = SOLANA_CONNECTION,
  _keypair: Keypair = Keypair.generate()
): Promise<Array<NFT>> => {
  // Get wallet's NFTs from Solana network
  const solanaNFTs = await getUserNFTsSolana(
    pubkey,
    _solanaConnection,
    _keypair
  );
  // Pepare tokens query for DB: "token[0], token[1], token[n]..."
  let tokens = "";
  if (solanaNFTs.length === 1) {
    tokens = `'${solanaNFTs[0].token}'`;
  } else if (solanaNFTs.length > 1) {
    for (const nft of solanaNFTs) {
      tokens += `'${nft.token}', `;
    }
    tokens = tokens.slice(0, -2);
  }
  console.log("wallet nfts", solanaNFTs); // !rm
  console.log("tokens", tokens); // !rm
  // Get user NFTs from DB (Master Editions)
  const userNFTsDB = await getNFTsByTokens(tokens);
  console.log("userNFTsDB", userNFTsDB); // !rm
  // Get NFTs amounts by Editions.
  const userEditions: any = await getEditionsByOwner(pubkey);
  const userNFTs: NFT[] = [];
  for (const nft of solanaNFTs) {
    for (const nftdb of userNFTsDB) {
      if (nftdb.__token__ == nft.token) {
        userNFTs.push(nft);
        break;
      }
    }
  }
  console.log("userNFTs", userNFTs); // !rm
  if (userNFTs) {
    if (userEditions) {
      for (const nft of userNFTs) {
        if (userEditions) {
          for (const edition of userEditions) {
            if (edition.__token__ == nft.token) {
              nft.amount++;
            }
          }
        }
      }
    }
    return userNFTs;
  }
  return [];
};

export const getUserNFTsSolana = async (
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
    const supply = await _solanaConnection.getTokenSupply(new PublicKey(mint));
    const nftRow = {
      token: mint as string,
      mint: rawNFT.address.toBase58() as string,
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
