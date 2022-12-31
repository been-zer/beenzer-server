import { Socket } from 'socket.io';
import {
  getTokenTransactions,
  getTokenHolders
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

const tokenSocket = async (socket: Socket): Promise<void> => {
  await getTokenTransactionsSocket(socket);
  await getTokenHoldersSocket(socket);
};

export default tokenSocket;