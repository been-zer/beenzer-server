// sockets
import { Server, Socket } from 'socket.io';
import { mintNFT } from './mintNFT';
import { sendNFT } from './sendNFT';
import { 
  sleep, 
  sqlFilter,
  concatPubKeys
} from '../utils';
import { 
  getUser, 
  isNewUser, 
  isUserName, 
  newUser, 
  updateUser,
  searchUsers,
  addFriends,
  deleteFriends,
  getUserFriends
} from '../controllers/users.controller';
import { 
  newNFT,
  getUserNFTs,
  addNFTCounter,
  getNFTCounter,
  getAllNFTs
} from '../controllers/nfts.controller';
import {
  getMessages, 
  newMessage,
  likeMessage,
  addEmoji,
  createMessages,
  deleteMessages
} from '../controllers/messages.controller';
import userSocket from './users.socket';

/**
 * @description Socket connection
 * @date 12/1/2022 - 12:09:49 PM
 *
 * @type {number}
 */

let usersConnected: number = 0;

export const socketConnect = (io: Server): void => {
  io.on("connection", async (socket: Socket) => {
    // Disconnect
    socket.on('disconnect', () => {
      usersConnected--;
      console.log(usersConnected, 'users connected.')
    });
    // Connection
    usersConnected++;
    console.log(usersConnected, 'users connected.');
    socket.emit("serverConnection", "Client connected to server succesfully");

    await userSocket(socket);


   

    // Friends functions
    socket.on('addFriend', async (pubkey: string, pubkey2: string) => {
      if ( pubkey.length > 22 && pubkey2.length > 22 ) {
        const table = concatPubKeys(pubkey, pubkey2);
        if ( await createMessages(table) ) {
          console.log('addFriend', pubkey, pubkey2);
          socket.emit('addFriendRes', await addFriends(pubkey, pubkey2));
        };
      }
    });
    socket.on('deleteFriend', async (pubkey: string, pubkey2: string) => {
      if ( pubkey.length > 22 && pubkey2.length > 22 ) {
        const table = concatPubKeys(pubkey, pubkey2);
        if ( await deleteMessages(table) ) {
          socket.emit('deleteFriendRes', await deleteFriends(pubkey, pubkey2));
        }
      }
    });
    socket.on('getUserFriends', async (pubkey:string) => {
      const userFriends = await getUserFriends(pubkey);
      if ( userFriends.length > 0 ) {
        socket.emit('userFriends', userFriends);
      } else {
        // console.log('WARNING: User has no friends yet.');
      }
    });

    // Messages functions
    socket.on('getMessages', async (pubkey:string, pubkey2:string) => {
      if ( pubkey.length > 22 && pubkey2.length > 22 ) {
        const table = concatPubKeys(pubkey, pubkey2);
        socket.emit('getMessagesRes', await getMessages(table));
      }
    });
    socket.on('newMessage', async (receiver:string, sender:string, message:string) => {
      if ( receiver.length > 22 && sender.length > 22 && message.length > 0 ) {
        const table = concatPubKeys(receiver, sender);
        socket.emit('newMessageRes', await newMessage(table, sender, message));
        socket.emit('getMessagesRes', await getMessages(table));
      }
    });
    socket.on('likeMessage', async (pubkey:string, pubkey2:string, timestamp:number) => {
      if ( pubkey.length > 22 && pubkey2.length > 22 ) {
        const table = concatPubKeys(pubkey, pubkey2);
        socket.emit('likeMessageRes', await likeMessage(table, timestamp));
        socket.emit('getMessagesRes', await getMessages(table));
      }
    });
    socket.on('addEmoji', async (pubkey:string, pubkey2:string, timestamp:number, emoji:string) => {
      if ( pubkey.length > 22 && pubkey2.length > 22 ) {
        const table = concatPubKeys(pubkey, pubkey2);
        socket.emit('addEmojiRes', await addEmoji(table, timestamp, emoji));
        socket.emit('getMessagesRes', await getMessages(table));
      }
    });
  });
}
