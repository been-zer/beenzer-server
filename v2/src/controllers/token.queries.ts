import { getDate, getTime } from "../utils";
import { transactionsSchema, holdersSchema } from "./schemas/token.schemas";

export function _getTokenTransactions(): string {
  return `SELECT * FROM transactions`;
}

export function _addTokenTransaction(
  type: string,
  amount: number,
  pubkey: string,
  flag: string
): string {
  return `INSERT INTO transactions (${transactionsSchema}) VALUES (${getDate()}), ${getTime()}, ${type}, ${amount}, ${pubkey}, ${flag}, ${Date.now()})`;
}

export function _getTokenHolders(): string {
  return `SELECT * FROM holders`;
}

export function _addTokenHolder(
  position: number,
  percentage: number,
  amount: number,
  pubkey: string,
  flag: string
): string {
  return `INSERT INTO holders (${holdersSchema}) VALUES (${Math.floor(
    position
  )}), ${percentage}, ${amount}, ${amount}, ${pubkey}, ${flag}, ${Date.now()})`;
}
