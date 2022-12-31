import { Server, Socket } from 'socket.io';
import userSocket from './users.socket';
import messagesSocket from './messages.socket';
import nftsSocket from './nfts.socket';
import tokenSocket from './token.socket';

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
    // Sockets
    await userSocket(socket);
    await messagesSocket(socket);
    await nftsSocket(socket);
    await tokenSocket(socket);  
  });
};
