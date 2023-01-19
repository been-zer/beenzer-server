import { Socket } from "socket.io";
import { sleep } from "../utils";
import { mintNFT } from "../services/mintNFT";
import { sendNFT } from "../services/sendNFT";
import {
  addNFTCounter,
  getNFTCounter,
  newNFT,
  getUserNFTs,
  getAllNFTs,
  getMapNFTs,
} from "../controllers/nfts.controller";

export const newMintSocket = (socket: Socket): void => {
  socket.on(
    "newMint",
    async (
      buffer: Buffer,
      type: string,
      creator: string,
      supply: number,
      username: string,
      description: string,
      city: string,
      latitude: number,
      longitude: number,
      distance: string,
      maxLat: string,
      minLat: string,
      maxLon: string,
      minLon: string
    ) => {
      let i = 0;
      while (i < 10) {
        if (await addNFTCounter()) {
          i = 10;
          break;
        }
        sleep(2000);
        i++;
      }
      const id = await getNFTCounter();
      console.log("BEENZER #", id);
      console.log(
        "Got newMint socket...",
        buffer,
        type,
        creator,
        description,
        latitude,
        longitude
      );
      i = 0;
      while (i < 10) {
        const token = await mintNFT(
          socket,
          id,
          buffer,
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
          minLon
        );
        if (token && token != "ERROR") {
          socket.emit(
            "mintLogs",
            `BEENZER minted succesfully! Solscan: https://explorer.solana.com/address/${token}?cluster=mainnet-beta`
          );
          console.log(
            "NFT minted succesfully! Solscan:",
            `https://explorer.solana.com/address/${token}?cluster=mainnet-beta`
          );
          i = 0;
          while (i < 10) {
            if (
              await newNFT(
                id,
                token,
                supply,
                creator,
                username,
                token.imageURL,
                type,
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
                `The Beenzer has been added to your collection! 🎉 ${token}`
              );
              console.log("NFT added to DB succesfully! 🎉");
              i = 0;
              while (i < 10) {
                if (await sendNFT(socket, creator, token, supply)) {
                  socket.emit("mintLogs", "true");
                  i = 10;
                  break;
                }
                sleep(3000);
                i++;
              }
            }
            sleep(3000);
            i++;
          }
        }
        sleep(3000);
        i++;
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

const nftsSocket = (socket: Socket): void => {
  newMintSocket(socket);
  getUserNFTsSocket(socket);
  getAllNFTsSocket(socket);
  getMapNFTsSocket(socket);
};

export default nftsSocket;
