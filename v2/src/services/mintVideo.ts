import fs from "fs";
import { mintNFT } from "./mintNFT";

const video = fs.readFileSync("./src/services/13.mp4");
const gif = fs.readFileSync("./src/services/out.gif");

mintNFT(
  6969,
  video,
  "video/mp4",
  1,
  "2TyAp92s7TEksnycmYY2Fk5i1j5anwFTqECyuFMVhomP",
  "alex",
  "video test",
  "Bcn",
  111,
  222,
  "1 Km",
  3232,
  233,
  2332,
  2332,
  gif
);
