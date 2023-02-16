import { getMapNFTs } from "../../controllers/nfts.controller";
import { getUserFollows } from "../../controllers/users.controller";

const getUserFeedbyLocation = async (
  pubkey: string,
  latitude: number,
  longitude: number
): Promise<any> => {
  try {
    const follows = await getUserFollows(pubkey);
    const following = [];
    for (const user of follows.rows) {
      following.push(user.__pubkey__);
    }
    const mapNFTs = await getMapNFTs(latitude, longitude);
    const userFeed = [];
    for (const nft of mapNFTs.rows) {
      for (const follow in following) {
        if (nft._creator == follow) {
          userFeed.push(nft);
        }
      }
    }
    return userFeed;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default getUserFeedbyLocation;
