import { Client } from 'pg';
import { tokenDB } from './db.connections';
import {
  _getTokenTransactions,
  _getTokenHolders,
  _addTokenTransaction,
  _addTokenHolder
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

export async function addTokenTransaction(type: string, amount: number, pubkey: string, flag: string): Promise<boolean> {
  try {
    await db.query(_addTokenTransaction(type, amount, pubkey, flag));
    return true;
  } catch (error) {
    if (String(error).includes('duplicate')) {
      console.log("ERROR: Transaction already exists");
      return false;
    }
    console.log(error);
    return false;
  }
}

export async function addTokenHolder(position: number, percentage: number, amount: number, pubkey: string, flag: string): Promise<boolean> {
  try {
    await db.query(_addTokenHolder(position, percentage, amount, pubkey, flag));
    return true;
  } catch (error) {
    if (String(error).includes('duplicate')) {
      console.log("ERROR: Transaction already exists");
      return false;
    }
    console.log(error);
    return false;
  }
}
