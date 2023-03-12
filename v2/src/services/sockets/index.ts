import { Server, Socket } from "socket.io";
import userSocket from "./users.socket";
import messagesSocket from "./messages.socket";
import nftsSocket from "./nfts.socket";
import tokenSocket from "./token.socket";
import servicesSocket from "./services.socket";

export let usersConnected: number = 0;

export const socketConnect = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    // Connection
    usersConnected++;
    socket.emit("nUsers", usersConnected);
    console.log(usersConnected, "users connected.");
    socket.emit("serverConnection", "Client connected to server succesfully");
    // Disconnection
    socket.on("disconnect", () => {
      usersConnected--;
      console.log(usersConnected, "users connected.");
      socket.emit("nUsers", usersConnected);
    });
    // Errors
    socket.on("error", (err: any) => {
      console.log("ERROR: Socket error:\n", err);
    });
    // Sockets
    userSocket(socket);
    messagesSocket(socket);
    nftsSocket(socket);
    tokenSocket(socket);
    servicesSocket(socket);
    // Debugging
    // socket.on("clientLogs", (message: string) => {
    //   console.log("client log", message);
    // });
    // let i = 0;
    // setInterval(() => {
    //   socket.emit("mintLogs", String(i));
    //   i++;
    // }, 5000);
  });
};
