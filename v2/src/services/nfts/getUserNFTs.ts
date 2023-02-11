import request from "request";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  getNFTsByTokens,
  getEditionsByTokens,
} from "../../controllers/nfts.controller";
import { Edition } from "./printNFT";
import { SOLANA_CONNECTION } from "../solanaConnection";

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

interface UserNFT {
  token: string;
  amount: number;
  supply: number;
  floor: number;
  ccy: string;
  creator: string;
  username: string;
  title: string;
  description: string;
  metadata_uri: string;
  image_uri: string;
  asset_uri: string;
  type: string;
}
export const getUserNFTs = async (
  pubkey: string,
  _solanaConnection: Connection = SOLANA_CONNECTION,
  _keypair: Keypair = Keypair.generate(),
  _logs: boolean = false
): Promise<UserNFT[]> => {
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
  if (_logs) {
    console.log("\neditionTokens query: ", tokens);
  }
  // Get NFTs amounts by counting Editions
  const userEditions: Edition[] | any = await getEditionsByTokens(tokens);
  if (_logs) {
    console.log("\nuserEditions: ", userEditions);
  }
  const masterTokens = [];
  for (const nft of solanaNFTs) {
    for (const edition of userEditions) {
      if (nft.token === edition.__token__) {
        masterTokens.push(edition.__master__ as string);
      }
    }
  }
  if (_logs) {
    console.log("\nmasterTokens query: ", masterTokens);
  }
  let nftsQuery = "";
  const amount: any = {};
  for (const master of masterTokens) {
    amount[master] = (amount[master] || 0) + 1;
    nftsQuery += `'${master}', `;
  }
  if (_logs) {
    console.log("\nToken amounts: ", amount);
  }
  nftsQuery = nftsQuery.slice(0, -2);
  if (_logs) {
    console.log("\nnftQuery", nftsQuery);
  }
  // Get user NFTs from DB (Master Editions)
  const userMasters = tokens.length > 0 ? await getNFTsByTokens(tokens) : [];
  if (_logs) {
    console.log("\nuserMastersNFTs: ", userMasters);
  }
  const userNFTs: UserNFT[] = [];
  for (const master of userMasters) {
    const userNFTrow: UserNFT = {
      token: master.__token__,
      amount: 1,
      supply: master._supply,
      floor: Number(master._floor),
      ccy: master._ccy,
      creator: master._creator,
      username: master._username,
      title: master._name,
      description: master._description,
      metadata_uri: master._metadata_uri,
      image_uri: master._image_uri,
      asset_uri: master._asset_uri,
      type: master._type,
    };
    userNFTs.push(userNFTrow);
  }
  if (_logs) {
    console.log("\nuserNFTs: ", userNFTs);
  }
  if (userNFTs) {
    // Update UserNFT amount
    for (const userNFT of userNFTs) {
      userNFT.amount = amount[userNFT.token];
    }
    if (_logs) {
      console.log("\nuserNFTs amounts: ", userNFTs);
    }
    return userNFTs;
  }
  if (_logs) {
    console.log("\ngetUserNFTs -> User has no NFTs..");
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
