import { Client } from "pg";
import { usersDB } from "./db.connections";
import {
  _getUser,
  _newUser,
  _updateUser,
  _getFriends,
  _isFriend,
  _addFriend,
  _removeFriend,
  _getUserFollows,
  _getUserFollowers,
  _getUserFriends,
  _isNewUser,
  _isUserName,
  _searchUsers,
  _usersFlags,
} from "./users.queries";
import {
  _getNFT,
  _newNFT,
  _updateNFTOwner,
  _updateNFTLikes,
  _createNFTtransactions,
} from "./nfts.queries";
// import {
//   createMessages,
//   deleteMessages
// } from './messages.controller';

const db: Client = usersDB;

export async function getUser(pubkey: string): Promise<any> {
  try {
    const data = await db.query(_getUser(pubkey));
    const rows = data.rows;
    return rows[0];
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function isUserName(username: string): Promise<any> {
  let user: any;
  try {
    user = await db.query(_isUserName(username));
  } catch (error) {
    console.log("isUserName Ctrl error:", error);
  }
  if (user.rowCount > 0) {
    return false;
  }
  return true;
}

export async function isNewUser(pubkey: string): Promise<boolean> {
  let user: any;
  try {
    user = await db.query(_isNewUser(pubkey));
  } catch (error) {
    console.log("isUserName Ctrl error:", error);
    return false;
  }
  if (user.rowCount > 0) {
    return false;
  }
  return true;
}

export async function newUser(
  pubkey: string,
  username: string,
  appuser: boolean
): Promise<boolean> {
  try {
    await db.query(_newUser(pubkey, username, appuser));
    return true;
  } catch (error) {
    if (String(error).includes("duplicate")) {
      console.log("ERROR: User already exists");
      return false;
    }
    console.log(error);
    return false;
  }
}

export async function updateUser(
  pubkey: string,
  update: string,
  value: string
): Promise<boolean> {
  try {
    await db.query(_updateUser(pubkey, update, value));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function addFriend(
  pubkey: string,
  pubkey2: string
): Promise<boolean> {
  try {
    await db.query(_addFriend(pubkey, pubkey2));
    return true;
  } catch (error) {
    if (String(error).includes("duplicate")) {
      console.log("ERROR: Fail to add friends connection to db!");
      return false;
    }
    console.log(error);
    return false;
  }
}

export async function removeFriend(
  pubkey: string,
  pubkey2: string
): Promise<boolean> {
  try {
    await db.query(_removeFriend(pubkey, pubkey2));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function isFriend(
  pubkey: string,
  pubkey2: string
): Promise<boolean> {
  try {
    const data = await db.query(_isFriend(pubkey, pubkey2));
    if (data.rows.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getUserFollows(pubkey: string): Promise<any> {
  try {
    const data = await db.query(_getUserFollows(pubkey));
    const rows = data.rows;
    const pubkeys = [];
    for (const row of rows) {
      pubkeys.push(row.__pubkey2__);
    }
    const follows = [];
    for (const publickey of pubkeys) {
      const user = await getUser(publickey);
      follows.push(user[0]);
    }
    return follows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getUserFollowers(pubkey: string): Promise<any> {
  try {
    const data = await db.query(_getUserFollowers(pubkey));
    const rows = data.rows;
    const pubkeys = [];
    for (const row of rows) {
      pubkeys.push(row.__pubkey__);
    }
    const followers = [];
    for (const publickey of pubkeys) {
      const user = await getUser(publickey);
      followers.push(user[0]);
    }
    return followers;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getUserFriends(pubkey: string): Promise<any> {
  try {
    const data = await db.query(_getUserFriends(pubkey));
    const rows = data.rows;
    const follows = [];
    const followers = [];
    for (const row of rows) {
      if (row.__pubkey__ === pubkey) {
        follows.push(row.__pubkey2__);
      } else if (row.__pubkey2__ === pubkey) {
        followers.push(row.__pubkey__);
      }
    }
    const matches = [];
    for (const x of follows) {
      if (followers.indexOf(x) !== -1) {
        matches.push(x);
      }
    }
    const friends = [];
    for (const publickey of matches) {
      const user = await getUser(publickey);
      friends.push(user[0]);
    }
    return friends;
  } catch (error) {
    console.log("ERROR: getUserFriends contrl failed:\n", error);
    return false;
  }
}

export async function getFriends(pubkey: string): Promise<any> {
  try {
    const data = await db.query(_getFriends(pubkey));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function searchUsers(search: string): Promise<any> {
  try {
    const data = await db.query(_searchUsers(search));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getUsersFlags(): Promise<any> {
  try {
    const data = await db.query(_usersFlags());
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}
