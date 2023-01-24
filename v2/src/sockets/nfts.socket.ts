import { Socket } from "socket.io";
import { sleep } from "../utils";
import { mintNFT } from "../services/mintNFT";
import { sendNFT } from "../services/sendNFT";
import { getUserNFTs } from "../services/getUserNFTs";
import {
  addNFTCounter,
  getNFTCounter,
  newNFT,
  getAllNFTs,
  getMapNFTs,
} from "../controllers/nfts.controller";

const TRIES = 10;

export const newMintSocket = (socket: Socket): void => {
  socket.on(
    "newMint",
    async (
      asset: Buffer,
      type: string,
      creator: string,
      supply: number,
      username: string,
      description: string,
      city: string,
      latitude: number,
      longitude: number,
      distance: string,
      maxLat: number,
      minLat: number,
      maxLon: number,
      minLon: number,
      image: Buffer
    ) => {
      let i = 0;
      while (i < TRIES) {
        if (await addNFTCounter()) {
          i = 10;
          break;
        }
        i++;
      }
      const id = (await getNFTCounter()) + 1;
      socket.emit("mintLogs", `Minting BEENZER #${id}...`);
      console.log("BEENZER #", id);
      console.log(
        "Got newMint socket...",
        asset,
        type,
        creator,
        description,
        latitude,
        longitude
      );
      i = 0;
      while (i < TRIES) {
        const token = await mintNFT(
          id,
          asset,
          type,
          supply,
          creator,
          username,
          description,
          city,
          latitude,
          longitude,
          distance,
          maxLat,
          minLat,
          maxLon,
          minLon,
          image
        );
        if (!token || token == "ERROR") {
          if (i == TRIES - 1) {
            console.log("Emit False");
            socket.emit("mintLogs", "false");
          }
          sleep(3000);
          i++;
          continue;
        } else {
          socket.emit(
            "mintLogs",
            `BEENZER #${id} minted succesfully! ⛏️ Token address: ${token}, Supply: ${supply}`
          );
          console.log(
            "NFT minted succesfully! Solscan:",
            `https://explorer.solana.com/address/${token}?cluster=mainnet-beta`
          );
          i = 0;
          while (i < TRIES) {
            if (!(await sendNFT(creator, token, supply))) {
              sleep(3000);
              i++;
              continue;
            } else {
              socket.emit(
                "mintLogs",
                `Transaction Success! 🚀 \n Check your wallet!`
              );
              i = 0;
              while (i < TRIES) {
                if (
                  !(await newNFT(
                    id,
                    token.toBase58(),
                    supply,
                    creator,
                    username,
                    token.imageURL,
                    type,
                    "BEENZER #" + String(id),
                    description,
                    city,
                    latitude,
                    longitude,
                    distance,
                    maxLat,
                    minLat,
                    maxLon,
                    minLon
                  ))
                ) {
                  sleep(1000);
                  i++;
                  continue;
                } else {
                  socket.emit(
                    "mintLogs",
                    `BEENZER #${id} has been added to your collection! 🎉`
                  );
                  socket.emit("mintLogs", "true");
                  console.log("NFT added to DB succesfully! 🎉");
                  i = 10;
                  break;
                }
              }
            }
          }
        }
        i++;
        sleep(3000);
      }
    }
  );
};

export const videoToGifSocket = (socket: Socket): void => {
  socket.on("videoToGif", async (video: Buffer) => {
    if (video) {
      console.log("video", video);
      // const gif = await videoToGif(video);
      // console.log("GIF", gif);
      socket.emit("videoToGifRes", video);
    }
  });
};

export const getUserNFTsSocket = (socket: Socket): void => {
  socket.on("getUserNFTs", async (pubkey: string) => {
    if (pubkey.length > 22) {
      socket.emit("userNFTs", await getUserNFTs(pubkey));
    }
  });
};

export const getAllNFTsSocket = (socket: Socket): void => {
  socket.on("getAllNFTs", async (res: string) => {
    if (res === "please") {
      socket.emit("allNFTs", await getAllNFTs());
    }
  });
};

export const getMapNFTsSocket = (socket: Socket): void => {
  socket.on("getMapNFTs", async (latitude: number, longitude: number) => {
    if (latitude && longitude) {
      socket.emit("mapNFTs", await getMapNFTs(latitude, longitude));
    }
  });
};

export const uploadVideoSocket = (socket: Socket): void => {
  socket.on("uploadVideo", (obj: any) => {
    console.log("UploadVideo", obj);
  });
};

const nftsSocket = (socket: Socket): void => {
  newMintSocket(socket);
  videoToGifSocket(socket);
  getUserNFTsSocket(socket);
  getAllNFTsSocket(socket);
  getMapNFTsSocket(socket);
  uploadVideoSocket(socket);
};

export default nftsSocket;
