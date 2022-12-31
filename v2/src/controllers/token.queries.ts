import { } from './token.schemas';

export const _getAllTokenTransactions = (): string => {
  return `SELECT * FROM transactions`;
};
