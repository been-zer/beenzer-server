import { Server, Socket } from 'socket.io';
import userSocket from './users.socket';
import messagesSocket from './messages.socket';
import nftsSocket from './nfts.socket';
import tokenSocket from './token.socket';

export let usersConnected: number = 0;

export const socketConnect = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    // Connection
    usersConnected++;
    console.log(usersConnected, 'users connected.');
    socket.emit("serverConnection", "Client connected to server succesfully");
    // Disconnection
    socket.on('disconnect', () => {
      usersConnected--;
      console.log(usersConnected, 'users connected.')
    });
    // Sockets
    userSocket(socket);
    messagesSocket(socket);
    nftsSocket(socket);
    tokenSocket(socket);  
  });
};
