import { usersSchema, friendsSchema } from './users.schemas';

export const _getUser = (pubkey: string): string => {
  return `SELECT * FROM users WHERE __pubkey__ = '${pubkey}'`;
};

export const _isUserName = (username: string): string => {
  return `SELECT * FROM users WHERE _username_ = '${username}'`;
};

export const _isNewUser = (pubkey: string): string => {
  return `SELECT * FROM users WHERE __pubkey__ = '${pubkey}'`;
};

export const _newUser = (pubkey: string, username: string, appuser: boolean): string => {     
  return `INSERT INTO users (${usersSchema}) VALUES ('${pubkey}', '${username}', '', '', '', '', '', '', '', '', '', '', false, '', '', '', '', '', '', '', '', ${appuser}, ${Date.now()}, ${Date.now()})`;
};

export const _updateUser = (pubkey: string, update: string, value: string): string => {
  return `UPDATE users SET ${update} = '${value}', _timestamp = ${Date.now()} WHERE __pubkey__ = '${pubkey}'`;
};

export const _addFriend = (pubkey: string, pubkey2: string): string => {
  return `INSERT INTO friends (${friendsSchema}) VALUES ('${pubkey}', '${pubkey2}', ${Date.now()})`;
};

export const _removeFriend = (pubkey: string, pubkey2: string): string => {
  return `DELETE FROM friends WHERE __pubkey__ = '${pubkey}' AND __pubkey2__ = '${pubkey2}'`;
};

export const _isFriend = (pubkey: string, pubkey2: string): string => {
  return `SELECT * FROM friends WHERE __pubkey__ = '${pubkey}' AND __pubkey2__ = '${pubkey2}'`;
};

export const _getUserFollows = (pubkey: string): string => {
  return `SELECT * FROM friends WHERE __pubkey__ = '${pubkey}'`;
};

export const _getUserFollowers = (pubkey: string): string => {
  return `SELECT * FROM friends WHERE __pubkey2__ = '${pubkey}'`;
};

export const _getUserFriends = (pubkey: string) => {
  return `SELECT * FROM friends WHERE __pubkey__ = '${pubkey}' OR __pubkey2__ = '${pubkey}'`;
};

export const _getFriends = (pubkey: string): string => {
  return `SELECT * FROM friends WHERE __pubkey__ = '${pubkey}'`;
};

export const _searchUsers = (search: string): string => {
  return `SELECT * FROM users WHERE __pubkey__ LIKE '${search}%' OR _username_ LIKE '${search}%'`;
};

export const _usersFlags = (): string => {
  return `SELECT __pubkey__, _flag FROM users WHERE _flag IS NOT EMPTY AND _flag != '🏴‍☠️'`;
};
