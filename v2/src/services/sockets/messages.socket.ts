import { Socket } from "socket.io";
import { concatPubKeys } from "../../utils";
import {
  getMessages,
  newMessage,
  likeMessage,
  unLikeMessage,
  addEmoji,
  delEmoji,
} from "../../controllers/messages.controller";

export const getMessagesSocket = (socket: Socket): void => {
  socket.on("getMessages", async (pubkey: string, pubkey2: string) => {
    if (pubkey.length > 22 && pubkey2.length > 22) {
      console.log("getMessages", pubkey, pubkey2);
      const table = concatPubKeys(pubkey, pubkey2);
      console.log(table);
      socket.emit("getMessagesRes", await getMessages(table));
    }
  });
};

export const newMessageSocket = (socket: Socket): void => {
  socket.on(
    "newMessage",
    async (receiver: string, sender: string, message: string) => {
      if (receiver.length > 22 && sender.length > 22 && message.length > 0) {
        const table = concatPubKeys(receiver, sender);
        socket.emit("newMessageRes", await newMessage(table, sender, message));
      }
    }
  );
};

export const likeMessageSocket = (socket: Socket): void => {
  socket.on(
    "likeMessage",
    async (pubkey: string, pubkey2: string, timestamp: number) => {
      if (pubkey.length > 22 && pubkey2.length > 22) {
        const table = concatPubKeys(pubkey, pubkey2);
        socket.emit("likeMessageRes", await likeMessage(table, timestamp));
      }
    }
  );
};

export const unLikeMessageSocket = (socket: Socket): void => {
  socket.on(
    "unLikeMessage",
    async (pubkey: string, pubkey2: string, timestamp: number) => {
      if (pubkey.length > 22 && pubkey2.length > 22) {
        const table = concatPubKeys(pubkey, pubkey2);
        socket.emit("unLikeMessageRes", await unLikeMessage(table, timestamp));
      }
    }
  );
};

export const addEmojiSocket = (socket: Socket): void => {
  socket.on(
    "addEmoji",
    async (
      pubkey: string,
      pubkey2: string,
      timestamp: number,
      emoji: string
    ) => {
      if (pubkey.length > 22 && pubkey2.length > 22) {
        const table = concatPubKeys(pubkey, pubkey2);
        socket.emit("addEmojiRes", await addEmoji(table, timestamp, emoji));
      }
    }
  );
};

export const delEmojiSocket = (socket: Socket): void => {
  socket.on(
    "delEmoji",
    async (
      pubkey: string,
      pubkey2: string,
      timestamp: number,
      emoji: string
    ) => {
      if (pubkey.length > 22 && pubkey2.length > 22) {
        const table = concatPubKeys(pubkey, pubkey2);
        socket.emit("delEmojiRes", await delEmoji(table, timestamp, emoji));
      }
    }
  );
};

const messagesSocket = (socket: Socket) => {
  getMessagesSocket(socket);
  newMessageSocket(socket);
  likeMessageSocket(socket);
  unLikeMessageSocket(socket);
  addEmojiSocket(socket);
  delEmojiSocket(socket);
};

export default messagesSocket;
