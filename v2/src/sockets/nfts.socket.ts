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
      minLon: number
      // image: Buffer
    ) => {
      console.log("newMint", username, creator);
      const nftFile = type.split("/")[0] || "unknown";
      let id = 0;
      let i = 0;
      while (i < TRIES) {
        if (i == TRIES - 1) {
          console.log("ERROR: Failed to get BEENZER id! ALERT: Last try...");
        }
        if (await addNFTCounter()) {
          id = (await getNFTCounter()) + 1;
          if (id) {
            socket.emit("mintLogs", `Minting ${nftFile} BEENZER #${id}...`);
            console.log(
              `Minting ${nftFile} BEENZER #${id}...`,
              `ID tries: ${i}`
            );
            i = TRIES;
            break;
          }
        }
        sleep(1000);
        i++;
      }
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
        false,
        TRIES
      );
      if (token && token != "ERROR") {
        socket.emit(
          "mintLogs",
          `BEENZER #${id} minted succesfully! ⛏️ Token address: ${token}, Supply: ${supply}`
        );
        if (await sendNFT(creator, token, supply, TRIES)) {
          socket.emit(
            "mintLogs",
            `Transaction Success! 🚀 \n Check your wallet!`
          );
          let j = 0;
          while (j < TRIES) {
            if (
              await newNFT(
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
              )
            ) {
              socket.emit(
                "mintLogs",
                `BEENZER #${id} has been added to your collection! 🎉`
              );
              console.log(`newNFT tries: ${j + 1}`);
              socket.emit("mintLogs", "true");
              j = TRIES;
              break;
            } else {
              if (j == TRIES - 1) {
                console.log("newNFT failed. Last try!!!");
              }
              sleep(1000);
              j++;
            }
          }
        }
      }
    }
  );
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
  getUserNFTsSocket(socket);
  getAllNFTsSocket(socket);
  getMapNFTsSocket(socket);
  uploadVideoSocket(socket);
};

export default nftsSocket;
