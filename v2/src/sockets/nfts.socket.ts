import { Socket } from "socket.io";
import { PublicKey } from "@solana/web3.js";
import { sleep } from "../utils";
import { SYMBOL, MASTER_COLLECTION } from "../services/solanaConnection";
import mintNFT from "../services/mintNFT";
import printNFT from "../services/printNFT";
import { getUserNFTs } from "../services/getUserNFTs";
import {
  addNFTCounter,
  getNFTCounter,
  newNFT,
  getAllNFTs,
  getMapNFTs,
} from "../controllers/nfts.controller";
import dotenv from "dotenv";
dotenv.config();
const TRIES = Number(process.env.ASYNC_TRIES);

export const mintNFTSocket = (socket: Socket): void => {
  socket.on(
    "mintNFT",
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
      image: Buffer | boolean | undefined
    ) => {
      console.log("mintNFT", username, creator);
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
            socket.emit("mintLogs", `Minting ${nftFile} ${SYMBOL} #${id}...`);
            console.log(
              `Minting ${nftFile} ${SYMBOL} #${id}... Tries: ${i + 1}`
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
        SYMBOL,
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
        image,
        MASTER_COLLECTION,
        TRIES
      );
      if (token && token != "ERROR") {
        socket.emit(
          "mintLogs",
          `⛏️ BEENZER #${id} minted succesfully! Token address: ${token}, Supply: ${supply}`
        );
        if (await printNFT(token, new PublicKey(creator), TRIES)) {
          socket.emit(
            "mintLogs",
            `🚀 Transaction Success! \n Check your wallet!`
          );
          const name = `${SYMBOL} #${id}`;
          let j = 0;
          while (j < TRIES) {
            console.log(`Adding ${name} to DB... Tries: ${j + 1}`);
            if (
              await newNFT(
                id,
                token.toBase58(),
                supply,
                creator,
                username,
                token.imageURL,
                type,
                name,
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
                `🎉 BEENZER #${id} has been added to your collection!`
              );
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

export const printNFTSocket = (socket: Socket): void => {
  socket.on("printNFT", async (token: string, pubkey: string) => {
    if (token.length > 22 && pubkey.length > 22) {
      socket.emit("printLogs", `🖨️ Printing NFT ${token}...`);
      const nftPrint = await printNFT(
        new PublicKey(token),
        new PublicKey(pubkey),
        TRIES
      );
      socket.emit("printNFT", nftPrint);
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
  mintNFTSocket(socket);
  printNFTSocket(socket);
  getUserNFTsSocket(socket);
  getAllNFTsSocket(socket);
  getMapNFTsSocket(socket);
  uploadVideoSocket(socket);
};

export default nftsSocket;
