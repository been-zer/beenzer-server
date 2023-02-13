import { Client } from "pg";
import { nftsDB } from "./db.connections";
import {
  _getNFT,
  _newNFT,
  _newEdition,
  _getEditionsByOwner,
  _updateNFTOwner,
  _updateNFTLikes,
  _createNFTtransactions,
  _newNFTtransactions,
  _getNFTCounter,
  _addNFTCounter,
  _getNFTsLength,
  _getNFTsByOwner,
  _getUserNFTs,
  _getNFTsByTokens,
  _getAllNFTs,
  _getMapNFTs,
  _newOwner,
} from "./nfts.queries";
import { getDate, getTime, sleep } from "../utils";

/**
 * @description Get createNFTtransactions data
 * @date 12/1/2022 - 11:52:26 AM
 *
 * @export
 * @async
 * @param {string} nft
 * @returns {string}
 */
const db: Client = nftsDB;

export async function getNFT(token: string, edition: number): Promise<any> {
  try {
    const data = await db.query(_getNFT(token, edition));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function newNFT(
  id: number,
  token: string,
  supply: number = 1,
  floor: number = 1,
  ccy: string = "SOL",
  creator: string,
  username: string,
  image: string,
  asset: string,
  type: string,
  metadata: string,
  name: string,
  description: string,
  city: string,
  latitude: number,
  longitude: number,
  visbility: string,
  maxLat: number,
  minLat: number,
  maxLon: number,
  minLon: number,
  _tries = 10,
  _logs = false
): Promise<boolean> {
  console.log("Token address:", token);
  if (token != "ERROR" && token.length > 0) {
    let i = 0;
    while (i < _tries) {
      console.log(`Adding ${name} to DB... Tries: ${i + 1}`);
      try {
        const date = getDate();
        const time = getTime();
        let assetUri = "";
        if (image != asset) {
          assetUri = asset;
        }
        if (id != -1) {
          await db.query(
            _newNFT(
              id,
              token,
              supply,
              floor,
              ccy,
              creator,
              username,
              image,
              assetUri,
              type,
              metadata,
              name,
              description,
              city,
              latitude,
              longitude,
              visbility,
              maxLat,
              minLat,
              maxLon,
              minLon,
              date,
              time
            )
          );
          console.log(`🎉 ${name} added to DB succesfully!`);
          return true;
        }
      } catch (error) {
        if (String(error).includes("duplicate")) {
          console.log("ERROR: NFT token already exists!");
          return false;
        }
        if (_logs) {
          console.log(error);
        }
        i++;
        console.log("ERROR: newNFT controller failed! Tries: ", i);
        sleep(3000);
      }
    }
    return false;
  }
  console.log(
    "ERROR: newNFT.controller failed! Token address input is ERROR or wrong!"
  );
  return false;
}

export async function newEdition(
  master: string,
  token: string,
  edition: number,
  owner: string,
  _tries = 10,
  _errLogs = false
): Promise<boolean> {
  if (
    master != "ERROR" &&
    master.length > 0 &&
    token != "ERROR" &&
    token.length > 0
  ) {
    let i = 0;
    while (i < _tries) {
      try {
        await db.query(_newEdition(master, token, edition, owner));
        console.log(`🎉 ${token} Edition ${edition} added to DB succesfully!`);
        return true;
      } catch (error) {
        if (_errLogs) {
          console.log(error);
        }
        i++;
        sleep(3000);
      }
    }
  }
  return false;
}

interface Edition {
  __master__: string;
  __token__: string;
  __edition__: string;
  _owner: string;
  _created_at: number;
  _timestamp: number;
}
export async function getEditionsByOwner(
  owner: string
): Promise<Array<Edition> | Promise<boolean>> {
  try {
    const data = await db.query(_getEditionsByOwner(owner));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getEditionsByTokens(
  tokens: string
): Promise<Array<Edition> | Promise<boolean>> {
  try {
    const data = await db.query(_getEditionsByOwner(tokens));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function newOwner(token: string, owner: string): Promise<boolean> {
  try {
    await db.query(_newOwner(token, owner));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getNFTsByOwner(owner: string): Promise<any> {
  try {
    const data = await db.query(_getNFTsByOwner(owner));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getUserNFTsDB(owner: string): Promise<any> {
  try {
    const nfts: Array<object> = [];
    const tokens: Array<string> = [];
    const nftsList = await getNFTsByOwner(owner);
    nftsList.forEach((owner: any) => tokens.push(owner.__token__));
    for (let i = 0; i < tokens.length; i++) {
      const nft = await getNFT(tokens[i], -1); // -1 = all available editions
      nfts.push(nft[0]);
    }
    return nfts;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getNFTsByTokens(tokens: string): Promise<any> {
  try {
    const data = await db.query(_getNFTsByTokens(tokens));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getAllNFTs(): Promise<any> {
  try {
    const data = await db.query(_getAllNFTs());
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getMapNFTs(
  latitude: number,
  longitude: number
): Promise<any> {
  try {
    const data = await db.query(_getMapNFTs(latitude, longitude));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getNFTCounter(): Promise<number> {
  try {
    const data = await db.query(_getNFTCounter());
    return Number(data.rows[0]._n);
  } catch (error) {
    console.log(error);
    return -1;
  }
}

export async function addNFTCounter(): Promise<boolean> {
  try {
    await db.query(_addNFTCounter());
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Deprecated...  use getNFTCounter() instead!
export async function getNFTsLength(): Promise<number> {
  try {
    const nftId = await db.query(_getNFTsLength());
    console.log("New NFT Beenzer #id number : ", Number(nftId.rows[0].count));
    return Number(nftId.rows[0].count);
  } catch (error) {
    console.log("ERROR: nfts.controller => getNFTid()");
    return -1;
  }
}

// To double check:

export async function updateNFTOwner(
  token: string,
  newOwner: string
): Promise<unknown> {
  try {
    await db.query(_updateNFTOwner(token, newOwner));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function updateNFTLikes(
  token: string,
  likes: number
): Promise<boolean> {
  try {
    await db.query(_updateNFTLikes(token, likes));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function createNFTtransactions(token: string): Promise<boolean> {
  try {
    await db.query(_createNFTtransactions(token));
    return true;
  } catch (error) {
    if (String(error).includes("duplicate")) {
      console.log("ERROR: Table already exists");
      return false;
    }
    console.log(error);
    return false;
  }
}

export async function newNFTtransactions(
  token: string,
  owner: string,
  pubkey: string,
  type: string,
  currency: string,
  amount: number,
  hash: string = ""
): Promise<boolean> {
  try {
    await db.query(
      _newNFTtransactions(token, owner, pubkey, type, currency, amount, hash)
    );
    return true;
  } catch (error) {
    if (String(error).includes("duplicate")) {
      console.log("ERROR: Table already exists");
      return false;
    }
    console.log(error);
    return false;
  }
}
