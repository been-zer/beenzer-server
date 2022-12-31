import { Client } from 'pg';
import { usersDB } from './db.connections';
import {
  _getUser,
  _newUser,
  _updateUser,
  _getFriends,
  _addFriends,
  _deleteFriends,
  _isNewUser,
  _isUserName,
  _searchUsers
} from './users.queries';
import {
  _getNFT,
  _newNFT,
  _updateNFTOwner,
  _updateNFTLikes,
  _createNFTtransactions,
} from './nfts.queries'
import {
  createMessages,
  deleteMessages
} from './messages.controller';

const db: Client = usersDB;

export async function getUser(pubkey: string): Promise<any> {
  try {
    const data = await db.query(_getUser(pubkey));
    const rows = data.rows;
    return rows;
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
    console.log('isUserName Ctrl error:', error);
  }
  if ( user.rowCount > 0 ) {
    return false;
  }
  return true;
}

export async function isNewUser(pubkey: string) {
  let user: any;
  try {
    user = await db.query(_isNewUser(pubkey));
  } catch (error) {
    console.log('isUserName Ctrl error:', error);
    return false;
  }
  if ( user.rowCount > 0 ) {
    return false;
  }
  return true;
}

export async function newUser(pubkey: string, username: string) {
  try {
    await db.query(_newUser(pubkey, username));
    return true;
  } catch (error) {
    if (String(error).includes('duplicate')) {
      console.log("ERROR: User already exists");
      return false;
    }
    console.log(error);
    return false;
  }
}

export async function updateUser(pubkey: string, update: string, value: string) {
  try {
    await db.query(_updateUser(pubkey, update, value));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}


export async function addFollower(pubkey: string, pubkey2: string) {
  try {
    await db.query(_addFriends(pubkey,pubkey2)); // __follower__ -> __user__
    return true;
  } catch (error) {
    if (String(error).includes('duplicate')) {
      console.log("ERROR: Table already exists");
      return false;
    }
    console.log(error);
    return false;
  }
}

export async function addFriends(pubkey: string, pubkey2: string) {
  try {
    await db.query(_addFriends(pubkey,pubkey2));
    // confirmation
    await db.query(_addFriends(pubkey2,pubkey));
    const table = '_'+pubkey+'_'+pubkey2+'_';
    if ( await createMessages(table) )
      return true;
    else
      return false;
  } catch (error) {
    if (String(error).includes('duplicate')) {
      console.log("ERROR: Fail to add friends connection to db!");
      return false;
    }
    console.log(error);
    return false;
  }
}

export async function deleteFriends(pubkey: string, pubkey2: string) {
  try {
    await db.query(_deleteFriends(pubkey, pubkey2));
    await db.query(_deleteFriends(pubkey2, pubkey));
    const table = '_'+pubkey+'_'+pubkey2+'_';
    if ( await deleteMessages(table) ) 
      return true;
    else
      return false;
  } catch (error) {
    console.log(error);
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

export async function getUserFriends(pubkey: string): Promise<any> {
  try {
    const friends: Array<any> = [];
    const pubkeys: Array<string> = [];
    const connections = await getFriends(pubkey) as Array<any>;
    connections.forEach((connection: any) => pubkeys.push(connection.__pubkey2__));
    for (let i = 0; i < pubkeys.length; i++) {
      const user = await getUser(pubkeys[i]);
      friends.push(user[0]);
    };
    return friends
  } catch (error) {
    console.log('ERROR: getUserFriends contrl failed:\n', error);
    return false;
  }
}

export async function deleteFollower(follower: string, user: string) {
  try {
    await db.query(_deleteFriends(follower, user));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function searchUsers(search: string) {
  try {
    const data = await db.query(_searchUsers(search));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}
