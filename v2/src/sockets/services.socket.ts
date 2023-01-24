import { Socket } from "socket.io";
import { videoToGif } from "../services/videoToGif";
// import fs from "fs";

export const videoToGifSocket = (socket: Socket): void => {
  socket.on("videoToGif", async (video: any) => {
    if (video) {
      console.log("video", video);
      // fs.writeFileSync(video, "test.mp4");
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
