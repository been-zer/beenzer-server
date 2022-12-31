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
    socket.on('newConnection', async (pubkey: string) => {
      console.log('NEW LOGIN:', pubkey)
      // Users functions
      const isNew = await isNewUser(pubkey);
      // console.log('isNewUser', isNew);
      socket.emit('isNewUser', isNew);
      if (isNew) {
        socket.on('userName', async (username) => {
          const regexUser = sqlFilter(username);
          if ( regexUser.length >= 3 ) {
            console.log('userName', regexUser);
            const userNameAv = await isUserName(regexUser);
            console.log('userNameAv', userNameAv);
            socket.emit('userNameAv', userNameAv);;
            if ( userNameAv ) {
              let i = 0;
              while ( i < 10 ) {
                if ( await newUser(pubkey, regexUser) ) {
                  socket.emit('newUserCreated', true);
                  console.log('New user created!');
                  const userInfo = await getUser(pubkey);
                  socket.emit('userInfo', userInfo);
                  i = 10;
                  break;
                } else {
                  console.log('New user creation failed.', i);
                  socket.emit('newUserCreated', false);
                  i++;
                }
              }
            }
          }
        });
      } 
      const userInfo = await getUser(pubkey);
      if ( userInfo.length > 0 ) {
        socket.emit('userInfo', userInfo);
      } else {
        // console.log('WARNING: No user info available from db.');
      }
      const userNFTs = await getUserNFTs(pubkey);
      if ( userNFTs.length > 0 ) {
        socket.emit('userNFTs', userNFTs);
      } else {
        // console.log('WARNING: User has no NFTs yet.');
      }
      const userFriends = await getUserFriends(pubkey);
      if ( userFriends.length > 0 ) {
        socket.emit('userFriends', userFriends);
      } else {
        // console.log('WARNING: User has no friends yet.');
      }
    });
    socket.on('searchUsers', async (search: string) => {
      // console.log('Searching...', search)
      if ( search.length >= 3 ) {
        socket.emit('searchUsersRes', await searchUsers(search));
      }
    });
    socket.on('getUser', async (user: string ) => {
      const userInfo = await getUser(user);
      socket.emit('getUserRes', userInfo)
    })
    socket.on('updateUser', async (pubkey: string, update: string, value: string) => {
      const pubkey_ = sqlFilter(pubkey);
      const update_ = sqlFilter(update);
      let value_ = sqlFilter(value);
      // console.log('update request', pubkey_, update_, value_)
      if ( value.slice(0, 2) === '__') {
        value_ = value.replace('__', '');
      }
      // console.log('update request', pubkey_, update_, value_)
      if ( pubkey_ && update_ && value_ ) {
        const isUserUpdate = await updateUser(pubkey_, update_, value_);
        // console.log('userInfo update:', isUserUpdate, update_, value_, pubkey_);
        socket.emit('updateUserRes', isUserUpdate);
        if ( isUserUpdate ) {
          const userInfo = await getUser(pubkey);
          socket.emit('userInfo', userInfo);
          console.log('Updated user succesfully!');
        } else {
          socket.emit('updateUserRes', false);
          console.log('useInfo update failed.');
        }
      }
    }); 

    // NFTS functions
    socket.on('newMint', async ( buffer: Buffer, type: string, creator: string, supply: number=1, username: string, description: string, city: string, latitude: number, longitude: number) => {
      let i = 0;
      while ( i < 10 ) {
        if ( await addNFTCounter() ) {
          i = 10;
          break;
        }
      }
      const id = await getNFTCounter();
      console.log('BEENZER #', id)
      console.log('Got newMint socket...', buffer, type, creator, description, latitude, longitude);
      const token = await mintNFT(socket, id, buffer, type, supply, creator, username, description, city, latitude, longitude);
      if ( token && token != 'ERROR' ) {
        socket.emit('mintLogs', `BEENZER minted succesfully! Solscan: https://explorer.solana.com/address/${token}?cluster=mainnet-beta`);
        console.log('NFT minted succesfully! Solscan:', `https://explorer.solana.com/address/${token}?cluster=mainnet-beta`);
        // sleep(10000);
        let i = 0;
        while ( i < 10 ) {
          if (await newNFT(id, token.toBase58(), supply, creator, username, token.imageURL, type, description, city, latitude, longitude)) {
            socket.emit('mintLogs', `The Beenzer has been added to your collection! 🎉 ${token}`);
            console.log('NFT added to DB succesfully! 🎉');
            i = 10;
            break;
          }
          sleep(3000);
          i++;
        }
        if ( await sendNFT(socket, creator, token, supply) ) {
          socket.emit('mintLogs', 'true');
        }
      }
    });
    socket.on('getUserNFTs', async (pubkey:string) => {
      if ( pubkey.length > 22 ) {
        socket.emit('userNFTs', await getUserNFTs(pubkey));
      }
    })
    socket.on('getAllNFTs', async (res:string) => {
      if ( res === 'please' ) {
        socket.emit('allNFTs', await getAllNFTs());
      }
    });

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
