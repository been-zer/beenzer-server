import { Socket } from "socket.io";
import { PublicKey } from "@solana/web3.js";
import { sleep } from "../../utils";
import {
  SYMBOL,
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
  getAllNFTs,
  getMapNFTs,
  getNFT,
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
        visbility,
        maxLat,
        minLat,
        maxLon,
        minLon,
        _royalties,
        _image,
        _mintCcy,
        MASTER_COLLECTION, // collection
        MASTER_PUBLICKEY, // owner
        false,
        TRIES
      );
      if (token.token && token != "ERROR") {
        socket.emit(
          "mintLogs",
          `⛏️ ${name} minted succesfully! Token address: ${token}, Supply: ${supply}`
        );
        const copy: any = await printNFT(token, new PublicKey(creator), TRIES);
        if (copy) {
          socket.emit("printLogs", `🚀 NFT successfully added to your wallet`);
          // const edition = Number(copy.edition) || 0;
          let j = 0;
          while (j < 2) {
            if (
              await newNFT(
                id,
                token.token.toBase58(),
                j,
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
                TRIES,
                false // print logs
              )
            ) {
              if (j === 0) {
                socket.emit(
                  "mintLogs",
                  `🎉 ${name} Master Edition has been added to your Collection! Once all copies are sold out, it will be transfered to the Marketplace for secondary sells. With an 8% royalties for you, forever!`
                );
              } else if (j === 1) {
                socket.emit(
                  "mintLogs",
                  `🎉 ${name} Edition 1 has been printed it to your wallet! You can transfer it, sell it, burn it, or hold it!`
                );
                socket.emit("mintLogs", "true");
                break;
              }
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
      const edition = await printNFT(
        new PublicKey(token),
        new PublicKey(pubkey),
        TRIES,
        true // return edition
      );
      if (Number(edition) > 1) {
        const masterEdition = await getNFT(token, 0); // 0 = Master Edition
        if (masterEdition) {
          if (
            await newNFT(
              masterEdition[0]._id_,
              masterEdition[0].__token__,
              Number(edition),
              masterEdition[0]._supply,
              masterEdition[0]._floor,
              masterEdition[0]._mintCcy,
              masterEdition[0]._creator,
              masterEdition[0]._username,
              masterEdition[0]._image,
              masterEdition[0]._asset,
              masterEdition[0]._type,
              masterEdition[0]._metadata,
              masterEdition[0]._name,
              masterEdition[0]._description,
              masterEdition[0]._city,
              masterEdition[0]._latitude,
              masterEdition[0]._longitude,
              masterEdition[0]._visbility,
              masterEdition[0]._maxLat,
              masterEdition[0]._minLat,
              masterEdition[0]._maxLon,
              masterEdition[0]._minLon,
              TRIES
            )
          ) {
            socket.emit(
              "printLogs",
              `🎉 ${name} Edition ${Number(
                edition
              )} has been printed succesfully!`
            );
            socket.emit("mintLogs", "true");
          }
        }
      } else {
        msg = `❌ - Print Edition failed!! Check Error logs.`;
        socket.emit("printLogs", msg);
        console.log("printLogs", msg);
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
