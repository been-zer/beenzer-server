import { Client } from "pg";
import { nftsDB } from "./db.connections";
import {
  _getNFT,
  _newNFT,
  _newEdition,
  _getNFTbyId,
  _updateNFTOwner,
  _updateNFTLikes,
  _createNFTtransactions,
  _newNFTtransactions,
  _getNFTCounter,
  _addNFTCounter,
  _subNFTCounter,
  _getNFTsLength,
  _getNFTsByOwner,
  _getUserNFTs,
  _getNFTsByTokens,
  _getNFTsByCreators,
  _getEditionsByTokens,
  _getEditionsByMinter,
  _getEditionsByMaster,
  _getAllNFTs,
  _getMapNFTs,
  _newOwner,
} from "./nfts.queries";
import { sleep } from "../utils";

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
  if (token != "ERROR" && token) {
    let i = 0;
    while (i < _tries) {
      try {
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
              minLon
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
        await sleep(3000);
      }
    }
    return false;
  }
  console.log(
    "ERROR: newNFT.controller failed! Token address input is ERROR or wrong!"
  );
  return false;
}

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

export async function getNFTbyId(id: number): Promise<any> {
  try {
    const data = await db.query(_getNFTbyId(id));
    const rows = data.rows;
    return rows[0];
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getNFTsByCreators(tokens: string): Promise<any> {
  try {
    const data = await db.query(_getNFTsByCreators(tokens));
    const rows = data.rows;
    return rows;
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

export async function getNewNFTid(
  _tries = 10,
  _printErr = false
): Promise<number> {
  let id = 0;
  let i = 0;
  while (i < _tries) {
    try {
      if (await addNFTCounter()) {
        id = (await getNFTCounter()) + 1;
        if (id) {
          return id;
        }
      }
    } catch (err) {
      if (_printErr) {
        console.log(err);
      }
      console.log(`❌ ERROR: getNewNFTid controller failed!`);
      sleep(3000);
      i++;
    }
  }
  return -1;
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

export async function subNFTCounter(): Promise<boolean> {
  try {
    await db.query(_subNFTCounter());
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export interface Edition {
  __master__: string;
  __edition__: number;
  _minter: string;
  _id: number;
  _date: string;
  _time: string;
  _timestamp: number;
}

export async function newEdition(
  master: string,
  edition: string,
  minter: string,
  id: number,
  _tries = 10,
  _errLogs = false
): Promise<boolean> {
  if (master != "ERROR" && edition != "ERROR" && master && edition) {
    let i = 0;
    while (i < _tries) {
      try {
        await db.query(_newEdition(master, edition, minter, id));
        console.log(`🎉 ${master} Edition ${id} added to DB succesfully!`);
        i = _tries;
        break;
      } catch (error) {
        if (_errLogs) {
          console.log(error);
        }
        i++;
        await sleep(3000);
      }
    }
    return true;
  }
  return false;
}

export async function getEditionsByMinter(
  minter: string
): Promise<Array<Edition> | boolean> {
  try {
    const data = await db.query(_getEditionsByMinter(minter));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getEditionsByTokens(
  tokens: string
): Promise<Array<Edition> | boolean> {
  if (tokens) {
    try {
      const data = await db.query(_getEditionsByTokens(tokens));
      const rows = data.rows;
      return rows;
    } catch (error) {
      console.log(error);
    }
  }
  return false;
}

export async function getLastEdition(master: string): Promise<number> {
  if (master) {
    try {
      const data = await db.query(_getEditionsByMaster(master));
      const rows = data.rows;
      if (rows.length > 1) {
        return Number(rows[rows.length - 1]._id);
      } else {
        return 1;
      }
    } catch (error) {
      console.log(error);
    }
  }
  return 0;
}

// Not in production

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

// Deprecated...  use getNFTCounter() instead
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
