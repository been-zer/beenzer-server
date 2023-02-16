import { getNFTsByCreators } from "../../controllers/nfts.controller";
import { getUserFollows } from "../../controllers/users.controller";

const getUserFeed = async (pubkey: string): Promise<any> => {
  try {
    const follows = await getUserFollows(pubkey);
    const following = [];
    for (const user of follows.rows) {
      following.push(user.__pubkey__);
    }
    let tokens = "";
    if (following.length === 1) {
      tokens = `'${following[0]}'`;
    } else if (following.length > 1) {
      for (const tk of following) {
        tokens += `'${tk}', `;
      }
      tokens = tokens.slice(0, -2);
    }
    if (tokens) {
      return await getNFTsByCreators(tokens);
    }
    return [];
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default getUserFeed;
