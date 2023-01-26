import fs from "fs";
import { uploadImage } from "./mintNFT";

export async function mintCollection(_tries: number = 10): Promise<boolean> {
  let i = 0;
  while (i < _tries) {
    try {
      const imageBuffer = fs.readFileSync("temp/imageCollection.png");
      const token = await uploadImage(
        imageBuffer,
        "BEENZER MASTER.png",
        _tries
      );
      console.log(token);
      return true;
    } catch (err) {
      console.log(err);
      i++;
    }
  }
  return false;
}
