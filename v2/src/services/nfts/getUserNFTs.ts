import { Connection, Keypair } from "@solana/web3.js";
import {
  getNFTsByTokens,
  getEditionsByTokens,
} from "../../controllers/nfts.controller";
import { Edition } from "./printNFT";
import { getWalletNFTs, NFT, Trait } from "./solanaNFTs";
import { SOLANA_CONNECTION } from "../solanaConnection";

export interface TokenTraits {
  token: string;
  traits: Trait[];
}
export interface UserNFT {
  master: string;
  editions: string[];
  amount: number;
  supply: number;
  floor: number;
  ccy: string;
  creator: string;
  username: string;
  image_uri: string;
  name: string;
  description: string;
  asset_uri: string;
  type: string;
  metadata_uri: string;
  attributes: Trait[];
}
export const getUserNFTs = async (
  pubkey: string,
  _solanaConnection: Connection = SOLANA_CONNECTION, // Optional
  _keypair: Keypair = Keypair.generate(), // Optional, new keypair for metaplex
  _logs: boolean = true // Optional, print logs
): Promise<UserNFT[]> => {
  // Get wallet's NFTs from Solana network
  const solanaNFTs: NFT[] = await getWalletNFTs(pubkey, _solanaConnection, _keypair);
  if (_logs) {
    console.log("\nsolanaNFTs: ", solanaNFTs);
  }
  const traits: TokenTraits[] = [];
  for (const nft of solanaNFTs) {
    const trait: TokenTraits = {
      token: nft.token,
      traits: nft.attributes
    };
    traits.push(trait);
  }
  if (_logs) {
    console.log("\nToken attributes: ", traits);
  }
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
  const userEditions: Edition[] | boolean | any = await getEditionsByTokens(tokens);
  const nftEditions = [];
  for (const userEdi of userEditions) {
    const nftEdiRow = {
      edition: userEdi as Edition,
      traits: traits[userEdi.copy]
    }
    nftEditions.push(nftEdiRow);
  }
  if (_logs) {
    console.log("\nnftEditions: ", nftEditions);
  }
  const masterTokens = [];
  for (const nft of solanaNFTs) {
    for (const edition of nftEditions) {
      if (nft.token === edition.edition.token) {
        const nftRow = {
          master: edition. as string,
          traits: edition.traits
        };
        masterTokens.push(edition.edition.__master__ as string);
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
      image_uri: master._image_uri,
      name: master._name,
      description: master._description,
      asset_uri: master._asset_uri,
      type: master._type,
      metadata_uri: master._metadata_uri,
      attributes: nftEditions[]

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
