import { } from './token.schemas';

export const _getTokenTransactions = (): string => {
  return `SELECT * FROM transactions`;
};

export const _getTokenHolders = (): string => {
  return `SELECT * FROM holders`;
};