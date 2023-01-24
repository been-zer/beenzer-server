import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { randomString } from "../utils";

export async function videoToGif(
  videoBuffer: Buffer,
  seconds: number = 3,
  fps: number = 3
): Promise<Buffer> {
  // create a temporary file to save the video buffer
  const tempFile = randomString(11);
  const videoFilePath = path.resolve(__dirname, "temp", tempFile + ".mp4");
  try {
    fs.writeFileSync(videoFilePath, videoBuffer);
    const gifBuffer = await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i ${videoFilePath} -t ${seconds} -vf "fps=${fps},scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 -f gif -`,
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
    return gifBuffer as Promise<Buffer>;
  } catch (err) {
    console.error(err);
    fs.unlinkSync(videoFilePath);
    return Buffer.alloc(0);
  }
}
