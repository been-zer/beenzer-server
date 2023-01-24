import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { randomString } from "../utils";

export async function videoToGif(videoBuffer: Buffer) {
  // create a temporary file to save the video buffer
  const videoFilePath = path.resolve(
    __dirname,
    "temp",
    randomString(11) + ".mp4"
  );
  fs.writeFileSync(videoFilePath, videoBuffer);
  const gifBuffer = await new Promise((resolve, reject) => {
    exec(
      `ffmpeg -i ${videoFilePath} -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 -f gif -`,
      {
        maxBuffer: Infinity,
        encoding: "buffer",
      },
      (err, stdout) => {
        if (err) reject(err);
        resolve(stdout);
      }
    );
  });
  // remove the temporary file
  fs.unlinkSync(videoFilePath);
  return gifBuffer;
}
