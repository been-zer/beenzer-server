import { Client } from 'pg';
import { tokenDB } from './db.connections';
import {
  _getTokenTransactions,
  _getTokenHolders
} from './token.queries';

const db: Client = tokenDB;

export async function getTokenTransactions(): Promise<any> {
  try {
    const data = await db.query(_getTokenTransactions());
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getTokenHolders(): Promise<any> {
  try {
    const data = await db.query(_getTokenHolders());
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}
