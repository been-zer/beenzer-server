import { Socket } from "socket.io";
import { videoToGif } from "../services/videoToGif";

export const videoToGifSocket = (socket: Socket): void => {
  socket.on("videoToGif", async (video: Buffer) => {
    if (video) {
      console.log("video", video);
      const gif = await videoToGif(video);
      console.log("GIF", gif);
      socket.emit("videoToGifRes", gif);
    }
  });
};

const servicesSocket = (socket: Socket): void => {
  videoToGifSocket(socket);
};

export default servicesSocket;
