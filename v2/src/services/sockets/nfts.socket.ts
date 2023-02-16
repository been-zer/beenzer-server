import { Socket } from "socket.io";
import { sleep } from "../../utils";
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
import getFeedByLocation from "../nfts/getFeedByLocation";
import {
  addNFTCounter,
  getNFTCounter,
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
      let id = 0;
      let i = 0;
      while (i < TRIES) {
        if (i == TRIES - 1) {
          console.log(
            `❌ ERROR: Failed to get ${SYMBOL} id! ALERT: Last try...`
          );
        }
        if (await addNFTCounter()) {
          id = (await getNFTCounter()) + 1;
          if (id) {
            socket.emit("mintLogs", `Minting ${nftFile} ${SYMBOL} #${id}...`);
            console.log(
              `⛏️  Minting ${nftFile} ${SYMBOL} #${id}... Tries: ${i + 1}`
            );
            i = TRIES;
            break;
          }
        }
        sleep(3000);
        i++;
      }
      const name = `${SYMBOL} #${id}`;
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
          true, // NFT is mutable (an be burned)
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
        socket.emit(
          "mintLogs",
          `⛏️  ${name} minted succesfully! Supply: ${supply}`
        );
        const masterNFT = await getNFTbyId(id);
        const masterToken: string = masterNFT.__token__;
        if (masterToken.length > 22) {
          socket.emit(
            "mintLogs",
            `✅  ${name} Master Edition has been added to your Collection! Once all copies are sold out, it will be transfered to the Marketplace for secondary sells. With an 8% royalties for you, forever!`
          );
          socket.emit("mintLogs", "true");
        }
      }
      socket.emit("mintLogs", "`❌ ERROR: Mint NFT failed! Check server logs.");
      socket.emit("mintLogs", "false");
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
      const msgErr = `❌ ERROR: printNFT socket inputs are wrong. Check master & pubkey args!`;
      socket.emit("printLogs", msgErr);
      console.log("printLogs", msgErr);
    }
  });
};

export const getUserNFTsSocket = (socket: Socket): void => {
  socket.on("getUserNFTs", async (pubkey: string) => {
    if (pubkey.length > 22) {
      const NFTs = await getUserNFTs(pubkey, SOLANA_CONNECTION, false, true);
      console.log("\nuserNFTs:\n", NFTs);
      socket.emit("userNFTs", NFTs);
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

export const getFeedSocket = (socket: Socket): void => {
  socket.on(
    "getFeed",
    async (pubkey: string, latitude: number, longitude: number) => {
      if (pubkey.length > 22) {
        socket.emit(
          "userFeed",
          await getFeedByLocation(pubkey, latitude, longitude)
        );
      } else {
        const msgErr = `❌ ERROR: getFeed socket input is wrong. Check pubkey arg!`;
        socket.emit("userFeed", msgErr);
        console.log("printLogs", msgErr);
      }
    }
  );
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
