/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import { Metaplex, CreateNftOutput,keypairIdentity, bundlrStorage, toMetaplexFile, toBigNumber, } from '@metaplex-foundation/js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { getDate, getTime, sleep } from '../utils';
import { Socket } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const secret = String(process.env.MASTER_WALLET_KEYPAIR).split(',') as any;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL as string;
const SOLANA_CONNECTION = new Connection(SOLANA_RPC_URL as string);
const WALLET = Keypair.fromSecretKey(new Uint8Array(secret));
const PUBKEY = process.env.MASTER_WALLET as string;
const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
  .use(keypairIdentity(WALLET))
  .use(bundlrStorage({
    address: `https://node1.bundlr.network`,
    providerUrl: SOLANA_RPC_URL,
    timeout: 360000,
  }));

async function uploadAsset(data: any, fileName: string) {
  console.log(`Step 1 - Uploading Asset to Arweave...`);
  try {
    const imgBuffer = Buffer.from(data, 'utf8');
    const imgMetaplexFile = toMetaplexFile(imgBuffer, fileName);
    const imgUri = await METAPLEX.storage().upload(imgMetaplexFile);
    return imgUri;
  } catch (err) {
    if ( String(err).includes('funds') ) {
      console.log('Not enough funds in the master wallet!!!')
    }
    console.log(err)
    return 'ERROR';
  }
}

async function uploadMetadata(imgUri: any, imgType: string, nftName: string, description: string, attributes: {trait_type: string, value: string}[]) {
  console.log(`Step 2 - Uploading Metadata to Arweave...`);
  try {
    const { uri } = await METAPLEX
      .nfts()
      .uploadMetadata({
        name: nftName,
        description: description,
        image: imgUri,
        attributes: attributes,
        properties: {
          files: [
            {
              type: imgType,
              uri: imgUri,
            },
          ],
        },
      }
    );
    return uri;
  } catch (err) {
    if ( String(err).includes('funds') ) {
      console.log('Not enough funds in the master wallet!!!')
    }
    console.log(err)
    return 'ERROR';
  }
}

async function mintTokens(metadataUri: string, name: string, supply: number, sellerFee: number, symbol: string, creators: {address: PublicKey, share: number}[]): Promise<any> {
  console.log(`Step 3 - Minting your BEENZER NFT in Solana...`);
  let nft: CreateNftOutput;
  let i = 0;
  while ( i < 10 ) {
    try {
      nft = await METAPLEX.nfts().create({
        uri: metadataUri,
        name: name,
        sellerFeeBasisPoints: sellerFee,
        symbol: symbol,
        creators: creators,
        isMutable: false,
        maxSupply: toBigNumber(supply),
      });
      console.log(`   Mint Success!🎉`);
      console.log(`   Minted NFT: https://explorer.solana.com/address/${nft.mintAddress.toBase58()}?cluster=mainnet-beta`);
      i = 10;
      return nft.mintAddress;
    } catch (err) {
      console.log(err);
      sleep(8000);
      i++;
    }
  }
}

export async function mintNFT(socket: Socket, id: number, buffer: Buffer, type: string, supply: number, creator: string, username: string, description: string, city: string, latitude: number, longitude: number): Promise<any> {

  const nftName = async () => {
    if (id !== -1) {
      return `BEENZER #${Number(id)+1}` as string
    }
    else {
      console.log('ERROR: NFT id undefined!!!')
      return 'ERROR'
    }
  }
  const CONFIG = {
    nftType: type,
    nftTitle: await nftName(),
    description: description,
    attributes: [
      { trait_type: 'CREATOR', value: creator },
      { trait_type: 'USERNAME', value: username },
      { trait_type: 'DATE', value: getDate() },
      { trait_type: 'TIME UTC', value: getTime() },
      { trait_type: 'CITY', value: city },// await getCity(latitude, longitude) },
      { trait_type: 'LATITUDE', value: String(latitude) },
      { trait_type: 'LONGITUDE', value: String(longitude) },
    ],
    sellerFeeBasisPoints: 800, // 800 bp = 8% royalties
    symbol: 'BEENZER',
    supply: supply,
    creators: [
      {address: new PublicKey(creator), share: 75},
      {address: WALLET.publicKey, share: 25},
    ],
  };
  socket.emit('mintLogs', `Minting ${CONFIG.nftTitle} NFT: ${creator}.`)
  console.log(`Minting ${CONFIG.nftTitle} to an NFT in Wallet ${PUBKEY}.`);
  // Step 1 - Upload media
  const assetUri = await uploadAsset(buffer, CONFIG.nftTitle);
  socket.emit('mintLongs', `Asset url: ${assetUri}`);
  console.log('Asset url:', assetUri);
  if ( assetUri === 'ERROR' ) {
    socket.emit('mintLogs', 'Uploading asset failed.');
    console.log('Uploading asset failed.');
    return 'ERROR';
  }
  // Step 2 - Upload metadata
  const metadataUri = await uploadMetadata(assetUri, CONFIG.nftType, CONFIG.nftTitle, CONFIG.description, CONFIG.attributes);
  socket.emit('mintLongs', `Metadata url: ${metadataUri}`);
  console.log('Metadata url:', metadataUri);
  if ( metadataUri === 'ERROR' ) {
    socket.emit('mintLogs', 'Uploading metadata failed.');
    console.log('Uploading metadata failed.');
    return 'ERROR';
  }
  // Step 3 - Mint NFT
  let token = await mintTokens(metadataUri, CONFIG.nftTitle, CONFIG.supply, CONFIG.sellerFeeBasisPoints, CONFIG.symbol, CONFIG.creators);
  if ( !token ) {
    socket.emit('mintLogs', 'Minting NFT failed. Trying again...');
    console.log('Minting NFT failed.');
    token = await mintTokens(metadataUri, CONFIG.nftTitle, CONFIG.supply, CONFIG.sellerFeeBasisPoints, CONFIG.symbol, CONFIG.creators);
    if ( !token ) {
      socket.emit('mintLogs', 'Minting NFT failed');
      return 'ERROR';
    }
  }
  socket.emit('mintLogs', `NFT minted! Token address: ${token}`);
  console.log("NFT minted! Token address:", token);
  token.imageURL = assetUri;
  
  return token;
}
