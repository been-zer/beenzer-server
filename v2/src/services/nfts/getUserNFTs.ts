import { Connection, Keypair } from "@solana/web3.js";
import {
  getNFTsByTokens,
  getEditionsByTokens,
} from "../../controllers/nfts.controller";
import { getWalletNFTs, NFT, Trait } from "./solanaNFTs";
import { SOLANA_CONNECTION } from "../../config";
import { Edition } from "./printNFT";

export interface EditionId {
  token: string;
  id: number;
}
export interface EditionNFT {
  master: string; // Master pubkey
  edition: EditionId; // Token + Edition number
  id: number; // Edition id
  traits: Trait[]; // NFT attributes
}
export interface TokenTraits {
  token: string;
  traits: Trait[];
}
export interface UserNFT {
  master: string;
  editions: EditionId[];
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
  _logs: boolean = true, // Optional, print logs
  _errLogs: boolean = true // Optional, print error logs
): Promise<UserNFT[]> => {
  try {
    // Get wallet's NFTs from Solana network
    const solanaNFTs: NFT[] = await getWalletNFTs(
      pubkey,
      _solanaConnection,
      Keypair.generate() // New keypair for Metaplex login
    );
    if (_logs) {
      console.log("\nsolanaNFTs: ", solanaNFTs);
    }
    // Keep NFT metadata attributes
    const traits: TokenTraits[] = [];
    for (const nft of solanaNFTs) {
      const trait: TokenTraits = {
        token: nft.token,
        traits: { ...nft.attributes },
      };
      traits.push(trait);
    }
    if (_logs) {
      console.log("\nToken attributes: ", traits);
    }
    // Pepare user NFT Edition tokens for querying DB: "token[0], token[1], token[n]..."
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
    // Get wallet NFT Editions from DB
    const userEditions: Edition[] | boolean | any = await getEditionsByTokens(
      tokens
    );
    // Create NFT Edition array
    const nftEditions = [];
    if (userEditions) {
      for (const userEdi of userEditions) {
        const nftEdiRow: EditionNFT = {
          master: userEdi.master as string,
          edition: {
            token: userEdi.copy as string,
            id: userEdi.id as number,
          } as EditionId,
          id: userEdi.edition as number,
          traits: { ...traits[userEdi.copy].traits } as Trait[],
        };
        nftEditions.push(nftEdiRow);
      }
    }
    if (_logs) {
      console.log("\nuserEditions: ", nftEditions);
    }
    // Pepare user NFT Master tokens for querying DB: "token[0], token[1], token[n]..."
    let masterTokens = "";
    if (nftEditions.length === 1) {
      masterTokens = `'${nftEditions[0].master}'`;
    } else if (nftEditions.length > 1) {
      for (const nft of nftEditions) {
        masterTokens += `'${nft.master}', `;
      }
      masterTokens = masterTokens.slice(0, -2);
    }
    if (_logs) {
      console.log("\nmasterTokens query: ", masterTokens);
    }
    // Get wallet NFT Masters from DB
    const userMasters =
      tokens.length > 0 ? await getNFTsByTokens(masterTokens) : [];
    if (_logs) {
      console.log("\nuserMasters: ", userMasters);
    }
    // Create userNFTs array to return
    const userNFTs: UserNFT[] = [];
    if (userMasters) {
      for (const master of userMasters) {
        const userNFTrow: UserNFT = {
          master: master.__token__,
          editions: [], // Fill in with userEditions
          amount: 1, // Update after fill in userNFTs.editions
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
          attributes: [], // Fill in with userEditions
        };
        for (const edition of nftEditions) {
          if (edition.master === master.__token__) {
            userNFTrow.editions.push(edition.edition);
            userNFTrow.attributes = [...edition.traits];
          }
        }
        userNFTrow.amount = userNFTrow.editions.length || 0;
        userNFTs.push(userNFTrow);
      }
    }
    if (_logs) {
      console.log("\nuserNFTs: ", userNFTs);
    }
    return userNFTs;
  } catch (err) {
    console.log("\nERROR in getUserNFTs.ts\n");
    if (_errLogs) {
      console.log(err);
    }
  }
  return [];
};
