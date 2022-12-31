import { Socket } from 'socket.io';
import {
  getTokenTransactions,
  getTokenHolders,
  addTokenTransaction,
  addTokenHolder
} from '../controllers/token.controller';

export const getTokenTransactionsSocket = async (socket: Socket): Promise<void> => {
  socket.on('getTokenTransactions', async () => {
    socket.emit('getTokenTransactionsRes', await getTokenTransactions());
  });
};

export const getTokenHoldersSocket = async (socket: Socket): Promise<void> => {
  socket.on('getTokenHolders', async () => {
    socket.emit('getTokenHoldersRes', await getTokenHolders());
  });
};

export const addTokenTransactionSocket = async (socket: Socket): Promise<void> => {
  socket.on('addTokenTransaction', async (type: string, amount: number, pubkey: string, flag: string) => {
    socket.emit('addTokenTransactionRes', await addTokenTransaction(type, amount, pubkey, flag));
  });
};

export const addTokenHolderSocket = async (socket: Socket): Promise<void> => {
  socket.on('addTokenHolder', async (position: number, percentage: number, amount: number, pubkey: string, flag: string) => {
    socket.emit('addTokenHolderRes', await addTokenHolder(position, percentage, amount, pubkey, flag));
  });
};

const tokenSocket = async (socket: Socket): Promise<void> => {
  await getTokenTransactionsSocket(socket);
  await getTokenHoldersSocket(socket);
  await addTokenTransactionSocket(socket);
  await addTokenHolderSocket(socket);
};

export default tokenSocket;