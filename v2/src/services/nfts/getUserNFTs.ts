import { Connection, Keypair } from "@solana/web3.js";
import {
  getNFTsByTokens,
  getEditionsByTokens,
} from "../../controllers/nfts.controller";
import { getWalletNFTs, NFT, Trait } from "./solanaNFTs";
import { SOLANA_CONNECTION } from "../../config";
import { Edition } from "./printNFT";

export interface EditionNFT {
  master: string; // Master pubkey
  edition: EditionId; // Token + Edition number
  id: number; // Edition id
  traits: Trait[]; // NFT attributes
}

export interface EditionId {
  token: string;
  id: number;
  timestamp: number;
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
  asset_uri: string;
  type: string;
  name: string;
  description: string;
  date: string;
  time: string;
  city: string;
  lat: number;
  lon: number;
  visibility: string;
  maxlat: number;
  minlat: number;
  maxlon: number;
  minlon: number;
  metadata_uri: string;
  attributes: Trait[];
}

const getUserNFTs = async (
  pubkey: string,
  _solanaConnection: Connection = SOLANA_CONNECTION, // Optional
  _logs: boolean = false, // Optional, print logs
  _errLogs: boolean = false // Optional, print error logs
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
        token: nft.account,
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
    const userEditions: Edition[] | boolean | any =
      (await getEditionsByTokens(tokens)) || [];
    if (_logs) {
      console.log("\nuserEditions: ", userEditions);
    }
    // Create NFT Edition array
    const nftEditions = [];
    if (userEditions) {
      for (const userEdi of userEditions) {
        let attributes: Trait[] = [];
        for (const x of traits) {
          if (x.token == userEdi.__edition__) {
            attributes = x.traits;
          }
        }
        const nftEdiRow: EditionNFT = {
          master: userEdi.__master__ as string,
          edition: {
            token: userEdi.__edition__ as string,
            id: userEdi._id as number,
            timestamp: userEdi._timestamp as number,
          } as EditionId,
          id: userEdi.edition as number,
          traits: attributes as Trait[],
        };
        nftEditions.push(nftEdiRow);
      }
    }
    if (_logs) {
      console.log("\nnftEditions: ", nftEditions);
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
    let userMasters = [];
    if (masterTokens) {
      userMasters = await getNFTsByTokens(masterTokens);
    }
    if (_logs) {
      console.log("\nuserMasters: ", userMasters);
    }
    // Create userNFTs array to return
    const userNFTs: UserNFT[] = [];
    if (userMasters) {
      for (const master of userMasters) {
        const userNFTrow: UserNFT = {
          master: master.__token__,
          editions: [], // To fill in with userEditions
          amount: 1, // Update after fill in userNFTs.editions
          supply: master._supply,
          floor: Number(master._floor),
          ccy: master._ccy,
          creator: master._creator,
          username: master._username,
          image_uri: master._image,
          asset_uri: master._asset,
          type: master._type,
          name: master._name,
          description: master._description,
          date: master._date,
          time: master._time,
          city: master._city,
          lat: master._latitude,
          lon: master._longitude,
          visibility: master._visibility,
          maxlat: master._maxlat,
          minlat: master._minlat,
          maxlon: master._maxlon,
          minlon: master._minlon,
          metadata_uri: master._metadata_uri,
          attributes: [], // To fill in with userEditions
        };
        // Update amount and attributes
        for (const edition of nftEditions) {
          if (edition.master === master.__token__) {
            userNFTrow.editions.push(edition.edition);
            console.log("traits", edition.traits);
            userNFTrow.attributes = edition.traits;
          }
        }
        userNFTrow.amount = userNFTrow.editions.length || 0;
        userNFTs.push(userNFTrow);
        console.log("attributes", userNFTrow.attributes);
      }
    }
    if (_logs) {
      console.log("\nuserNFTs: ", userNFTs, "\n\n");
    }
    return userNFTs;
  } catch (err) {
    console.log("\n❌ ERROR: getUserNFTs failed!\n");
    if (_errLogs) {
      console.log(err);
    }
  }
  return [];
};

export default getUserNFTs;
