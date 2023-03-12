import { Socket } from "socket.io";
import {
  SYMBOL,
  MARKET_PUBKEY,
  MASTER_COLLECTION,
  MASTER_PUBLICKEY,
  SOLANA_CONNECTION,
} from "../../config";
import mintNFT from "../nfts/mintNFT";
import printNFT from "../nfts/printNFT";
import getUserNFTs from "../nfts/getUserNFTs";
import getUserFeed from "../nfts/getUserFeed";
import getFeedByLocation from "../nfts/getFeedByLocation";
import {
  getNewNFTid,
  subNFTCounter,
  getAllNFTs,
  getNFTbyId,
  getLastEdition,
  getMapNFTs,
} from "../../controllers/nfts.controller";
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
      visbility: string,
      maxLat: number,
      minLat: number,
      maxLon: number,
      minLon: number,
      _image: Buffer | boolean = false, // Optional
      _royalties: number = 1000, // Optional
      _mintCcy: string = "SOL" // OptionalgetFeed
    ) => {
      console.log("mintNFT", username, creator);
      const nftFile = type.split("/")[0] || "unknown";
      const id = await getNewNFTid(TRIES, false);
      const name = `${SYMBOL} #${id}`;
      const log1 = `⛏️  Minting ${nftFile} ${name}...`;
      socket.emit("mintLogs", log1);
      console.log("\nLOG1", log1);
      if (
        await mintNFT(
          id,
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
          true, // NFT is mutable (can be burned)
          _royalties,
          _image,
          _mintCcy,
          MASTER_COLLECTION, // NFT collection
          MASTER_PUBLICKEY, // Owner (payer)
          false, // It is not a sized collection
          TRIES, // Async tries
          false // Print error logs
        )
      ) {
        const log2 = `⛏️  ${name} minted succesfully! Supply: ${supply}`;
        socket.emit("mintLogs", log2);
        console.log("\nLOG2", log2);
        const masterNFT = await getNFTbyId(id);
        const masterToken: string = masterNFT.__token__;
        if (masterToken.length > 22) {
          const log3 = `✅  ${name} Master Edition has been added to your Collection! Once all copies are sold out, it will be transfered to the Marketplace for secondary sells. With an 8% royalties for you, forever!`;
          socket.emit("mintLogs", log3);
          console.log("\nLOG3", log3);
          socket.emit("mintLogs", "true");
        }
      } else {
        socket.emit(
          "mintLogs",
          "❌ ERROR: Mint NFT failed! Please try again. No extra charges will be applied!"
        );
        if (await subNFTCounter()) {
          console.log(
            "❌ ERROR: Mint NFT failed! Substracted NFT counter correctly."
          );
        }
        socket.emit("mintLogs", "false");
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
      if (
        await printNFT(
          master,
          pubkey,
          TRIES, // Async tries
          "SEND", // When max supply send to marketplace
          MARKET_PUBKEY, // Wallet where to transfer the Master Edition after maxSupply reached
          true // Print error logs
        )
      ) {
        const edition = await getLastEdition(master);
        if (edition > 1) {
          socket.emit(
            "printLogs",
            `🎉 Master: ${master} \nEdition ${edition} has been printed succesfully!`
          );
          socket.emit("printLogs", "true");
        } else {
          const msgErr = `❌ ERROR: Print Edition failed!! Edition id: !${edition}!`;
          socket.emit("printLogs", msgErr);
          console.log("printLogs", msgErr);
        }
      } else {
        const msgErr = `❌ ERROR: Print Edition failed!! PrintNFT func failed!`;
        socket.emit("printLogs", msgErr);
        console.log("printLogs", msgErr);
      }
    } else {
      const msgErr = `❌ ERROR: PrintNFT socket inputs are wrong. Check master & pubkey args!`;
      socket.emit("printLogs", msgErr);
      console.log("printLogs", msgErr);
    }
  });
};

export const getUserNFTsSocket = (socket: Socket): void => {
  socket.on("getUserNFTs", async (pubkey: string) => {
    if (pubkey.length > 22) {
      socket.emit(
        "userNFTs",
        await getUserNFTs(pubkey, SOLANA_CONNECTION, false, false)
      );
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

export const getFeedSocket = (socket: Socket): void => {
  socket.on(
    "getFeed",
    async (pubkey: string, latitude: number, longitude: number) => {
      if (pubkey.length > 22) {
        socket.emit(
          "getFeedRes",
          await getFeedByLocation(pubkey, latitude, longitude)
        );
      } else {
        const msgErr = `❌ ERROR: getFeed socket input is wrong. Check args!`;
        socket.emit("getFeedRes", msgErr);
        console.log("printLogs", msgErr);
      }
    }
  );
};

export const getUserFeedSocket = (socket: Socket): void => {
  socket.on("getUserFeed", async (pubkey: string) => {
    if (pubkey.length > 22) {
      socket.emit("getUserFeedRes", await getUserFeed(pubkey));
    } else {
      const msgErr = `❌ ERROR: getUserFeed socket input is wrong. Check pubkey arg!`;
      socket.emit("getUserFeedRes", msgErr);
      console.log("printLogs", msgErr);
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

export const uploadVideoSocket = (socket: Socket): void => {
  socket.on("uploadVideo", (obj: any) => {
    console.log("UploadVideo", obj);
  });
};

const nftsSocket = (socket: Socket): void => {
  mintNFTSocket(socket);
  printNFTSocket(socket);
  getUserNFTsSocket(socket);
  getMapNFTsSocket(socket);
  getFeedSocket(socket);
  getUserFeedSocket(socket);
  getAllNFTsSocket(socket);
  uploadVideoSocket(socket);
};

export default nftsSocket;
