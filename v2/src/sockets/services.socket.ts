import { Socket } from "socket.io";
import { videoToGif } from "../services/videoToGif";
import fs from "fs";

export const videoToGifSocket = (socket: Socket): void => {
  socket.on("videoToGif", async (video: Buffer) => {
    if (video) {
      console.log("video", video);
      fs.writeFileSync("temp/test.mp4", video);
      const gif = await videoToGif(video);
      console.log("GIF", gif);
      fs.writeFileSync("temp/test.gif", gif);
      socket.emit("videoToGifRes", gif);
    }
  });
};

const servicesSocket = (socket: Socket): void => {
  videoToGifSocket(socket);
};

export default servicesSocket;
