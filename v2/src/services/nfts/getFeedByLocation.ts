import { getMapNFTs } from "../../controllers/nfts.controller";
import { getUserFollows } from "../../controllers/users.controller";

const getFeedbyLocation = async (
  pubkey: string,
  latitude: number,
  longitude: number,
  _logs: boolean = true // Optional, print logs
): Promise<any> => {
  try {
    const follows = await getUserFollows(pubkey);
    const following = [];
    for (const user of follows) {
      following.push(user.__pubkey__);
    }
    const mapNFTs = await getMapNFTs(latitude, longitude);
    const userFeed = [];
    for (const nft of mapNFTs) {
      for (const follow of following) {
        if (nft._creator == follow) {
          userFeed.push(nft);
        }
      }
    }
    if (_logs) {
      console.log("\nfollows\n", follows);
      console.log("\nfollowing\n", following);
      console.log("\nmapNFTs\n", mapNFTs);
      console.log("\nuserFeed\n", userFeed);
    }
    return userFeed;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default getFeedbyLocation;
