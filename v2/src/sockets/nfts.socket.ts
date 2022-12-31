import { Socket } from 'socket.io';
import { sqlFilter } from '../utils';


const nftsSocket = async (socket: Socket): Promise<void> => {
  // NFTS functions
  socket.on('newMint', async ( buffer: Buffer, type: string, creator: string, supply: number=1, username: string, description: string, city: string, latitude: number, longitude: number) => {
    let i = 0;
    while ( i < 10 ) {
      if ( await addNFTCounter() ) {
        i = 10;
        break;
      }
    }
    const id = await getNFTCounter();
    console.log('BEENZER #', id)
    console.log('Got newMint socket...', buffer, type, creator, description, latitude, longitude);
    const token = await mintNFT(socket, id, buffer, type, supply, creator, username, description, city, latitude, longitude);
    if ( token && token != 'ERROR' ) {
      socket.emit('mintLogs', `BEENZER minted succesfully! Solscan: https://explorer.solana.com/address/${token}?cluster=mainnet-beta`);
      console.log('NFT minted succesfully! Solscan:', `https://explorer.solana.com/address/${token}?cluster=mainnet-beta`);
      // sleep(10000);
      let i = 0;
      while ( i < 10 ) {
        if (await newNFT(id, token.toBase58(), supply, creator, username, token.imageURL, type, description, city, latitude, longitude)) {
          socket.emit('mintLogs', `The Beenzer has been added to your collection! 🎉 ${token}`);
          console.log('NFT added to DB succesfully! 🎉');
          i = 10;
          break;
        }
        sleep(3000);
        i++;
      }
      if ( await sendNFT(socket, creator, token, supply) ) {
        socket.emit('mintLogs', 'true');
      }
    }
  });
  socket.on('getUserNFTs', async (pubkey:string) => {
    if ( pubkey.length > 22 ) {
      socket.emit('userNFTs', await getUserNFTs(pubkey));
    }
  })
  socket.on('getAllNFTs', async (res:string) => {
    if ( res === 'please' ) {
      socket.emit('allNFTs', await getAllNFTs());
    }
  });

}