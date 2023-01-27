import { Socket } from "socket.io";
import { PublicKey } from "@solana/web3.js";
import { sleep } from "../utils";
import {
  SYMBOL,
  MASTER_COLLECTION,
  MASTER_PUBLICKEY,
} from "../services/solanaConnection";
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
      floor: number,
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
      _image: Buffer | boolean = false, // Optional
      _mintCcy: string = "SOL" // Optional
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
      const name = `${SYMBOL} #${id}`;
      const token = await mintNFT(
        name,
        asset,
        SYMBOL,
        type,
        supply,
        floor,
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
        _image,
        _mintCcy,
        MASTER_COLLECTION, // collection
        MASTER_PUBLICKEY, // owner
        false,
        TRIES
      );
      if (token && token != "ERROR") {
        socket.emit(
          "mintLogs",
          `⛏️ ${name} minted succesfully! Token address: ${token}, Supply: ${supply}`
        );
        const copy: any = await printNFT(token, new PublicKey(creator), TRIES);
        if (copy) {
          socket.emit("printLogs", `🚀 NFT successfully added to your wallet`);
          const edition = Number(copy.edition) || 0;
          let j = 0;
          while (j < TRIES) {
            console.log(`Adding ${name} to DB... Tries: ${j + 1}`);
            if (
              await newNFT(
                id,
                token.toBase58(),
                0,
                supply,
                floor,
                _mintCcy,
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
              if (
                await newNFT(
                  id,
                  token.toBase58(),
                  edition,
                  supply,
                  floor,
                  _mintCcy,
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
                  `🎉 ${name} has been added to your collection!`
                );
                socket.emit("mintLogs", "true");
                j = TRIES;
                break;
              }
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
      let msg = `🖨️ Printing NFT ${token}...`;
      socket.emit("printLogs", msg);
      console.log("printLogs", msg);
      const copy = await printNFT(
        new PublicKey(token),
        new PublicKey(pubkey),
        TRIES
      );
      console.log(copy);
      // if (copy) {
      //   while (i < TRIES) {
      //     let i = 0;

      //     if (
      //       await newNFT(
      //         id,
      //         copy.toBase58(),
      //         edition,
      //         supply,
      //         floor,
      //         _mintCcy,
      //         creator,
      //         username,
      //         token.imageURL,
      //         type,
      //         name,
      //         description,
      //         city,
      //         latitude,
      //         longitude,
      //         distance,
      //         maxLat,
      //         minLat,
      //         maxLon,
      //         minLon
      //       )
      //     ) {
      //       socket.emit(
      //         "mintLogs",
      //         `🎉 ${name} has been added to your collection!`
      //       );
      //       socket.emit("mintLogs", "true");
      //       i = TRIES;
      //       break;
      //     }
      //   }
      // } else {
      //   msg = `❌ - Transaction not confirmed!`;
      //   socket.emit("printLogs", msg);
      //   console.log("printLogs", msg);
      // }
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
