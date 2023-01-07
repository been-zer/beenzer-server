import { Socket } from 'socket.io';
import {
  sqlFilter,
  concatPubKeys
} from '../utils';
import {
  isNewUser,
  isUserName,
  newUser,
  getUser,
  updateUser,
  getUserFriends,
  searchUsers,
  addFriends,
  deleteFriends
} from '../controllers/users.controller';
import {
  createMessages,
  deleteMessages
} from '../controllers/messages.controller';
import { getUserNFTs } from '../controllers/nfts.controller';

export const newConnectionSocket = (socket: Socket): void => {
  socket.on('newConnection', async (pubkey: string) => {
    console.log('NEW LOGIN:', pubkey)
    const isNew = await isNewUser(pubkey);
    console.log('isnew:', isNew);
    socket.emit('isNewUser', isNew);
    await userDataSocket(socket, pubkey);
  });
};

export const newDisconnectionSocket = (socket: Socket): void => {
  socket.on('newDisconnection', (pubkey: string) => {
    console.log('NEW LOGOUT:', pubkey)
  });
};

export const newUserSocket = async (socket: Socket): Promise<void> => {
  socket.on('newUser', async (pubkey: string, username: string, appuser: boolean) => {
    if (username.length >= 3) {
      const regexUser = sqlFilter(username);
      if (regexUser.length >= 3) {
        if (await newUser(pubkey, regexUser, appuser)) {
          socket.emit('newUserCreated', true);
          console.log('New user created!', regexUser, pubkey);
          await userDataSocket(socket, pubkey);
        } else {
          console.log('New user creation failed.');
          socket.emit('newUserCreated', false);
        }
      }
    }
  });
};

export const usernameExistsSocket = (socket: Socket) => {
  socket.on('userName', async (username: string) => {
    const regexUser = sqlFilter(username);
    const userNameAv = await isUserName(regexUser);
    socket.emit('userNameAv', userNameAv);
  });
};

export const userDataSocket = async (socket: Socket, pubkey: string): Promise<void> => {
  const userInfo = await getUser(pubkey);
  socket.emit('userInfo', userInfo);
  const userNFTs = await getUserNFTs(pubkey);
  socket.emit('userNFTs', userNFTs);
  const userFriends = await getUserFriends(pubkey);
  socket.emit('userFriends', userFriends);
};

export const searchUsersSocket = (socket: Socket): void => {
  socket.on('searchUsers', async (search: string) => {
    const inputClean: string = sqlFilter(search);
    if (inputClean.length >= 3) {
      socket.emit('searchUsersRes', await searchUsers(inputClean));
    }
  });
};

export const getUserSocket = (socket: Socket): void => {
  socket.on('getUser', async (user: string) => {
    const userInfo = await getUser(user);
    socket.emit('getUserRes', userInfo)
  })
};

export const updateUserSocket = (socket: Socket): void => {
  socket.on('updateUser', async (pubkey: string, update: string, value: string) => {
    const pubkey_ = sqlFilter(pubkey);
    const update_ = sqlFilter(update);
    let value_ = sqlFilter(value);
    if (value.slice(0, 2) === '__') {
      value_ = value.replace('__', '');
    }
    if (pubkey_ && update_ && value_) {
      const isUserUpdate = await updateUser(pubkey_, update_, value_);
      socket.emit('updateUserRes', isUserUpdate);
      if (isUserUpdate) {
        const userInfo = await getUser(pubkey);
        socket.emit('userInfo', userInfo);
        console.log('Updated user succesfully!');
      } else {
        socket.emit('updateUserRes', false);
        console.log('useInfo update failed.');
      }
    }
  });
};

export const addFriendSocket = (socket: Socket): void => {
  socket.on('addFriend', async (pubkey: string, pubkey2: string) => {
    if (pubkey.length > 22 && pubkey2.length > 22) {
      const table = concatPubKeys(pubkey, pubkey2);
      if (await createMessages(table)) {
        console.log('addFriend', pubkey, pubkey2);
        socket.emit('addFriendRes', await addFriends(pubkey, pubkey2));
      };
    }
  });
};

export const deleteFriendSocket = (socket: Socket): void => {
  socket.on('deleteFriend', async (pubkey: string, pubkey2: string) => {
    if (pubkey.length > 22 && pubkey2.length > 22) {
      const table = concatPubKeys(pubkey, pubkey2);
      if (await deleteMessages(table)) {
        socket.emit('deleteFriendRes', await deleteFriends(pubkey, pubkey2));
      }
    }
  });
};

export const getUserFriendsSocket = (socket: Socket): void => {
  socket.on('getUserFriends', async (pubkey: string) => {
    const userFriends = await getUserFriends(pubkey);
    if (userFriends.length > 0) {
      socket.emit('userFriends', userFriends);
    } else {
      socket.emit('userFriends', 0);
    }
  });
};

const userSocket = (socket: Socket): void => {
  newConnectionSocket(socket);
  newDisconnectionSocket(socket);
  newUserSocket(socket);
  usernameExistsSocket(socket);
  searchUsersSocket(socket);
  getUserSocket(socket);
  updateUserSocket(socket);
  addFriendSocket(socket);
  deleteFriendSocket(socket);
  getUserFriendsSocket(socket);
};

export default userSocket;
