import { Client } from "pg";
import { messagesDB } from "./db.connections";
import { 
  _createMessages,
  _deleteMessages,
	_newMessage, 
	_getMessages, 
	_likeMessage, 
	_addEmoji 
} from "./queries";

const db: Client = messagesDB;

export async function createMessages(table: string): Promise<Boolean> {
  try {
		await db.query(_createMessages(table));
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

export async function deleteMessages(table: string): Promise<Boolean> {
  try {
		await db.query(_deleteMessages(table));
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

export async function newMessage(table: string, owner: string, message: string): Promise<Boolean> {
	try {
		await db.query(_newMessage(table, owner, message));
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

export async function getMessages(table: string): Promise<any> {
	try {
    const data = await db.query(_getMessages(table));
    const rows = data.rows;
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function likeMessage(table: string, timestamp: number): Promise<Boolean> {
	try {
    await db.query(_likeMessage(table, Math.floor(timestamp)));
		return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function addEmoji(table: string, timestamp: number, emoji: string): Promise<Boolean> {
	try {
    await db.query(_addEmoji(table, Math.floor(timestamp), emoji));
		return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
