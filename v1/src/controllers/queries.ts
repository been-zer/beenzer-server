import { userSchema, friendsSchema, nftSchema, ownerSchema, transactionsSchema, messagesSchema, messagesInit } from './schemas';
// User sql queries

export const _getUser = (pubkey: string): string => {
  return `SELECT * FROM users WHERE __pubkey__ = '${pubkey}'`;
};

export const _isUserName = (username: string): string => {
  return `SELECT * FROM users WHERE _username_ = '${username}'`;
};

export const _isNewUser = (pubkey: string): string => {
  return `SELECT * FROM users WHERE __pubkey__ = '${pubkey}'`;
};

export const _newUser = (pubkey: string, username: string): string => {
  return `INSERT INTO users (${userSchema}) VALUES ('${pubkey}', '${username}', '', '', '', '', '', '', '', false, '', '', '', '', '', ${Date.now()}, ${Date.now()})`;
};

export const _updateUser = (pubkey: string, update: string, value: string): string => {
  return `UPDATE users SET ${update} = '${value}', _timestamp = ${Date.now()} WHERE __pubkey__ = '${pubkey}'`;
};

export const _addFriends = (pubkey: string, pubkey2: string): string => {
  return `INSERT INTO friends (${friendsSchema}) VALUES ('${pubkey}', '${pubkey2}', ${Date.now()})`;
};

export const _deleteFriends = (pubkey: string, pubkey2: string): string => {
  return `DELETE FROM friends WHERE __pubkey__ = '${pubkey}' OR __pubkey2__ = '${pubkey2}'`;
};

export const _getFriends = (pubkey: string): string => {
  return `SELECT * FROM friends WHERE __pubkey__ = '${pubkey}'`;
};

export const _getUserFriends = (pubkeys: Array<string>) => {
  const friends: Array<string> = [];
  pubkeys.forEach((pubkey: string): void => {
    friends.push(`SELECT * FROM users WHERE __pubkey__ = '${pubkey}'`);
  });
  return friends;
}

export const _searchUsers = (search: string): string => {
  return `SELECT * FROM users WHERE __pubkey__ LIKE '${search}%' OR _username_ LIKE '${search}%'`;
};

/**
 * @description Get newNFT data
 * @date 12/1/2022 - 11:35:04 AM
 *
 * @param {string} token
 * @param {string} creator
 * @param {string} asset
 * @param {string} description
 * @param {string} latitue
 * @param {string} longitute
 * @param {string} attributes
 * @returns {string}
 */

// NFT sql queries
export const _getNFT = (token: string): string => {
  return `SELECT * FROM nfts WHERE __token__ = '${token}'`;
};

export const _newNFT = (id: number, token: string, supply: number=1, creator: string, username: string, asset: string, type: string, description: string, city: string, latitude: number, longitude: number, date: string, time: string): string => {
  return `INSERT INTO nfts (${nftSchema}) VALUES (${id}, '${token}', ${supply}, '${creator}', '${username}', '${asset}', '${type}', '${description}', '${city}', ${latitude}, ${longitude}, '${date}', '${time}', ${Date.now()})`;
};

export const _newOwner = (token: string, owner: string): string => {
  return `INSERT INTO owners (${ownerSchema}) VALUES ('${token}', '${owner}', ${Date.now()})`;
};

export const _getNFTsByOwner = (owner: string): string => {
  return `SELECT * FROM owners WHERE _owner = '${owner}'`;
};

export const _getUserNFTs = (tokens: Array<string>): Array<string> => {
  const nfts: Array<string> = [];
  tokens.forEach((token: string): void => {
    nfts.push(`SELECT * FROM nfts WHERE __token__ = '${token}'`);
  });
  return nfts;
};

export const _getAllNFTs = (): string => {
  return `SELECT * FROM nfts`;
};

export const _updateNFTOwner = (token: string, newOwner: string): string => {
  return `UPDATE nfts SET _owner = ${newOwner} WHERE __token__ = '${token}'`;
};

export const _updateNFTLikes = (token: string, likes: number) => {
  return `UPDATE nfts SET _likes = ${likes} WHERE __token__ = '${token}'`;
};

export const _createNFTtransactions = (token: string): string => {
  return `CREATE TABLE _${token}_ (${transactionsSchema})`;
};

export const _getNFTCounter = () => {
  return `SELECT * from counter`;
};

export const _addNFTCounter = () => {
  return `UPDATE counter SET _n = _n + 1, _timestamp = ${Date.now()}`;
};

export const _getNFTsLength = () => {
  return `SELECT COUNT(__t_getNFTsByOwneroken__) FROM nfts`
};

export const _newNFTtransactions = (token: string, owner: string, pubkey: string, type: string, currency: string, amount: number, hash: string = ''): string => {
  if (type === 'BID')
    return `INSERT INTO _${token}_ (${transactionsSchema}) VALUES ('${owner}', '${pubkey}', '${type}', '${currency}', ${amount}, '', ${Date.now()}`;
  else if (type === 'ASK')
    return `INSERT INTO ${token} (${transactionsSchema}) VALUES ('${pubkey}', '${owner}', '${type}', '${currency}', ${amount}, ${hash}, ${Date.now()}`;
  else {
    console.log('Bad type. Type can only BID or ASK')
    return 'BAD REQUEST';
  }
};

/**
 * @description Get getNFTtransactions data
 * @date 12/1/2022 - 11:35:04 AM
 *
 * @param {string} token
 * @param {string} owner
 * @param {string} pubkey
 * @param {string} type
 * @param {string} currency
 * @param {number} amount
 * @param {string} [hash='']
 * @returns {string}
 */

export const _createMessages = (table: string): string => {
  return `CREATE TABLE ${table} (${messagesInit})`;
};

export const _deleteMessages = (table: string): string => {
  return `DROP TABLE ${table}`;
};

export const _newMessage = (table: string, owner: string, message: string): string => {
  return `INSERT INTO ${table} (${messagesSchema}) VALUES ('${owner}', '${message}', false, '', ${Date.now()})`;
};

export const _getMessages = (table: string): string => {
  return `SELECT * FROM ${table}`;
};

export const _likeMessage = (table: string, timestamp: number): string => {
  return `UPDATE ${table} SET _liked = 'true' WHERE _timestamp = ${timestamp}`;
};

export const _addEmoji = (table: string, timestamp: number, emoji: string): string => {
  return `UPDATE ${table} SET _emoji = ${emoji} WHERE _timestamp = ${timestamp}`;
};
