import { messagesSchema, messagesInit } from "./messages.schemas";

export const _createMessages = (table: string): string => {
  return `CREATE TABLE ${table} (${messagesInit})`;
};

export const _deleteMessages = (table: string): string => {
  return `DROP TABLE ${table}`;
};

export const _newMessage = (
  table: string,
  owner: string,
  message: string
): string => {
  return `INSERT INTO ${table} (${messagesSchema}) VALUES ('${owner}', '${message}', false, '', ${Date.now()})`;
};

export const _getMessages = (table: string): string => {
  return `SELECT * FROM ${table}`;
};

export const _likeMessage = (table: string, timestamp: number): string => {
  return `UPDATE ${table} SET _liked = 'true' WHERE _timestamp = ${timestamp}`;
};

export const _unLikeMessage = (table: string, timestamp: number): string => {
  return `UPDATE ${table} SET _liked = 'false' WHERE _timestamp = ${timestamp}`;
};

export const _addEmoji = (
  table: string,
  timestamp: number,
  emoji: string
): string => {
  return `UPDATE ${table} SET _emoji = ${emoji} WHERE _timestamp = ${timestamp}`;
};

export const _delEmoji = (
  table: string,
  timestamp: number,
  emoji: string
): string => {
  return `UPDATE ${table} SET _emoji = '' WHERE _timestamp = ${timestamp} AND _emoji = ${emoji}`;
};
