import { Client } from "pg";
import { nftsDB } from "./db.connections";
import {
  _getNFT,
  _newNFT,
  _updateNFTOwner,
  _updateNFTLikes,
  _createNFTtransactions,
  _newNFTtransactions,
  _getNFTCounter,
  _addNFTCounter,
  _getNFTsLength,
  _getNFTsByOwner,
  _getUserNFTs,
  _getAllNFTs,
  _getMapNFTs,
  _newOwner,
} from "./nfts.queries";
import { getDate, getTime } from "../utils";

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

export async function getNFT(token: string): Promise<any> {
  try {
    const data = await db.query(_getNFT(token));
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
  creator: string,
  username: string,
  asset: string,
  type: string,
  description: string,
  city: string,
  latitude: number,
  longitude: number,
  distance: string,
  maxLat: string,
  minLat: string,
  maxLon: string,
  minLon: string
): Promise<boolean> {
  if (token != "ERROR" && token.length > 0) {
    try {
      const date = getDate();
      const time = getTime();
      if (id != -1) {
        await db.query(
          _newNFT(
            id,
            token,
            supply,
            creator,
            username,
            asset,
            type,
            description,
            city,
            latitude,
            longitude,
            distance,
            maxLat,
            minLat,
            maxLon,
            minLon,
            date,
            time
          )
        );
        await newOwner(token, creator);
        return true;
      } else {
        console.log("ERROR: newNFT.controller failed! NFT id is -1!");
        return false;
      }
    } catch (error) {
      if (String(error).includes("duplicate")) {
        console.log("ERROR: NFT token already exists!");
        return false;
      }
      console.log(error);
      return false;
    }
  }
  console.log(
    "ERROR: newNFT.controller failed! Token address input is ERROR or wrong!"
  );
  return false;
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

export async function getUserNFTs(owner: string): Promise<any> {
  try {
    const nfts: Array<object> = [];
    const tokens: Array<string> = [];
    const nftsList = await getNFTsByOwner(owner);
    nftsList.forEach((owner: any) => tokens.push(owner._token));
    for (let i = 0; i < tokens.length; i++) {
      const nft = await getNFT(tokens[i]);
      nfts.push(nft[0]);
    }
    return nfts;
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
    const rows = Number(data.rows[0]._n);
    return rows;
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
