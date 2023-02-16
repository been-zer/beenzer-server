import { getMapNFTs } from "../../controllers/nfts.controller";

const getUserFeedbyLocation = async (
  string: string,
  latitude: number,
  longitude: number
): Promise<any> => {
  try {
    let mapNFTs = await getMapNFTs(latitude, longitude);
    mapNFTs = mapNFTs.rows;
    return mapNFTs;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default getUserFeedbyLocation;
