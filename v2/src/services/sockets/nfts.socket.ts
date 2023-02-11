import { Socket } from "socket.io";
import { PublicKey } from "@solana/web3.js";
import { sleep } from "../../utils";
import {
  SYMBOL,
  MARKETPLACE_PUBKEY,
  MASTER_COLLECTION,
  MASTER_PUBLICKEY,
} from "../solanaConnection";
import mintNFT from "../nfts/mintNFT";
import printNFT from "../nfts/printNFT";
import { getUserNFTs } from "../nfts/getUserNFTs";
import {
  addNFTCounter,
  getNFTCounter,
  newNFT,
  newEdition,
  getAllNFTs,
  getMapNFTs,
} from "../../controllers/nfts.controller";
import dotenv from "dotenv";
dotenv.config();

const TRIES = Number(process.env.ASYNC_TRIES);

interface Token {
  token: string;
  imageUri: string;
  assetUri: string;
  metadataUri: string;
}
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
      visbility: string,
      maxLat: number,
      minLat: number,
      maxLon: number,
      minLon: number,
      _image: Buffer | boolean = false, // Optional
      _royalties: number = 1000, // Optional
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
      const token: Token = await mintNFT(
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
        visbility,
        maxLat,
        minLat,
        maxLon,
        minLon,
        _royalties,
        _image,
        _mintCcy,
        MASTER_COLLECTION, // NFT collection
        MASTER_PUBLICKEY, // Owner (payer)
        false, // It is not a Sized Collection
        TRIES, // Async tries
        false // Print Error logs
      );
      if (token.token != "ERROR") {
        socket.emit(
          "mintLogs",
          `⛏️ ${name} minted succesfully! Token address: ${token.token}, Supply: ${supply}`
        );

        socket.emit("printLogs", `🚀 NFT successfully added to your wallet`);
        if (
          await newNFT(
            id,
            token.token,
            supply,
            floor,
            _mintCcy,
            creator,
            username,
            token.imageUri,
            token.assetUri,
            type,
            token.metadataUri,
            name,
            description,
            city,
            latitude,
            longitude,
            visbility,
            maxLat,
            minLat,
            maxLon,
            minLon,
            TRIES, // Async tries
            false // Print Error logs
          )
        ) {
          socket.emit(
            "mintLogs",
            `🎉 ${name} Master Edition has been added to your Collection! Once all copies are sold out, it will be transfered to the Marketplace for secondary sells. With an 8% royalties for you, forever!`
          );
        } else {
          socket.emit("mintLogs", "newNFT controller failed!");
          socket.emit("mintLogs", "false");
        }
        const firstEdition: any = await printNFT(
          new PublicKey(token.token),
          new PublicKey(creator),
          TRIES, // Async tries
          true // Return Edition
        );
        if (firstEdition) {
          if (
            await newEdition(
              token.token,
              firstEdition.token,
              1,
              creator,
              TRIES, // Async tries
              true // Print Error logs
            )
          ) {
            socket.emit(
              "mintLogs",
              `🎉 ${name} Edition 1 has been printed it to your wallet! You can transfer it, sell it, burn it, or hold it!`
            );
            socket.emit("mintLogs", "true");
          }
        } else {
          socket.emit("mintLogs", "newEdition controller failed!");
          socket.emit("mintLogs", "false");
        }
      }
    }
  );
};

export const printNFTSocket = (socket: Socket): void => {
  socket.on("printNFT", async (master: string, pubkey: string) => {
    if (master.length > 22 && pubkey.length > 22) {
      const msg = `🖨️ Printing NFT ${master}...`;
      socket.emit("printLogs", msg);
      console.log("printLogs", msg);
      const edition: any = await printNFT(
        new PublicKey(master),
        new PublicKey(pubkey),
        TRIES,
        true, // Return Edition int
        "SEND", // When max supply send to marketplace
        MARKETPLACE_PUBKEY,
        true // Print error logs
      );
      if (Number(edition) > 1) {
        if (
          await newEdition(
            master,
            edition.token,
            Number(edition),
            pubkey,
            TRIES, // Async tries
            true // Return Edition
          )
        ) {
          socket.emit(
            "printLogs",
            `🎉 ${edition.token} Edition ${Number(
              edition
            )} has been printed succesfully!`
          );
          socket.emit("printLogs", "true");
        }
      } else {
        const msgErr = `❌ - Print Edition failed!! Check Error logs.`;
        socket.emit("printLogs", msgErr);
        console.log("printLogs", msgErr);
      }
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
