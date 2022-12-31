import { Socket } from 'socket.io';
import { sqlFilter } from '../utils';
import { 
  isNewUser, 
  isUserName,
  newUser,
  getUser,
  updateUser,
  getUserFriends,
  searchUsers,

} from '../controllers/users.controller';
import { getUserNFTs } from '../controllers/nfts.controller';

export const newConnectionSocket = async (socket: Socket): Promise<void>  => {
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
};

export const searchUsersSocket = async (socket: Socket): Promise<void>  => {
  socket.on('searchUsers', async (search: string) => {
    // console.log('Searching...', search)
    if ( search.length >= 3 ) {
      socket.emit('searchUsersRes', await searchUsers(search));
    }
  });
};

export const getUserSocket = async (socket: Socket): Promise<void>  => {
  socket.on('getUser', async (user: string ) => {
    const userInfo = await getUser(user);
    socket.emit('getUserRes', userInfo)
  })
};

export const updateUserSocket = async (socket: Socket): Promise<void>  => {
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
};

const userSocket = async (socket: Socket): Promise<void> => {
  await newConnectionSocket(socket);
  await searchUsersSocket(socket);
  await getUserSocket(socket);
  await updateUserSocket(socket);
};

export default userSocket;
