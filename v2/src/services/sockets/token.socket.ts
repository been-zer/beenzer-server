import { Socket } from "socket.io";
import { getTokenHolders } from "../token/getTokenHolders";
import {
  getTokenTransactions,
  // getTokenHolders,
  addTokenTransaction,
  addTokenHolder,
} from "../../controllers/token.controller";

export const getTokenTransactionsSocket = (socket: Socket): void => {
  socket.on("getTokenTransactions", async () => {
    socket.emit("getTokenTransactionsRes", await getTokenTransactions());
  });
};

export const getTokenHoldersSocket = (socket: Socket): void => {
  socket.on("getTokenHolders", async () => {
    socket.emit("getTokenHoldersRes", await getTokenHolders());
  });
};

export const addTokenTransactionSocket = (socket: Socket): void => {
  socket.on(
    "addTokenTransaction",
    async (type: string, amount: number, pubkey: string, flag: string) => {
      socket.emit(
        "addTokenTransactionRes",
        await addTokenTransaction(type, amount, pubkey, flag)
      );
    }
  );
};

export const addTokenHolderSocket = (socket: Socket): void => {
  socket.on(
    "addTokenHolder",
    async (
      position: number,
      percentage: number,
      amount: number,
      pubkey: string,
      flag: string
    ) => {
      socket.emit(
        "addTokenHolderRes",
        await addTokenHolder(position, percentage, amount, pubkey, flag)
      );
    }
  );
};

const tokenSocket = (socket: Socket): void => {
  getTokenTransactionsSocket(socket);
  getTokenHoldersSocket(socket);
  addTokenTransactionSocket(socket);
  addTokenHolderSocket(socket);
};

export default tokenSocket;
