// Connect to PotsgreSQL
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

/**
 * @description Connect to PostgreSQL USER/NFT/MESSAGES databases/tables
 * @date 12/1/2022 - 11:17:22 AM
 *
 * @type {String}
 */

const usersDBurl: string = String(process.env.USERS_DB_URL);
export const usersDB: Client = new Client(usersDBurl);
usersDB.connect();

const messagesDBurl: string = String(process.env.MESSAGES_DB_URL);
export const messagesDB: Client = new Client(messagesDBurl);
messagesDB.connect();

const nftsDBurl: string = String(process.env.NFTS_DB_URL);
export const nftsDB: Client = new Client(nftsDBurl);
nftsDB.connect();

const tokenDBurl: string = String(process.env.TOKEN_DB_URL);
export const tokenDB: Client = new Client(tokenDBurl);
tokenDB.connect();

