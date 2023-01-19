import { nftSchema, ownerSchema, transactionsSchema } from "./nfts.schemas";

export const _getNFT = (token: string): string => {
  return `SELECT * FROM nfts WHERE __token__ = '${token}'`;
};

export const _newNFT = (
  id: number,
  token: string,
  supply: number = 1,
  creator: string,
  username: string,
  asset: string,
  type: string,
  name: string,
  description: string,
  city: string,
  latitude: number,
  longitude: number,
  distance: string,
  minLat: number,
  maxLat: number,
  maxLon: number,
  minLon: number,
  date: string,
  time: string
): string => {
  return `INSERT INTO nfts (${nftSchema}) VALUES (${id}, '${token}', ${supply}, '${creator}', '${username}', '${asset}', '${type}', '${name}', '${description}', '${city}', ${latitude}, ${longitude}, '${distance}', ${maxLat}, ${minLat}', ${maxLon}, ${minLon}, '${date}', '${time}', ${Date.now()})`;
};

export const _newOwner = (token: string, owner: string): string => {
  return `INSERT INTO owners (${ownerSchema}) VALUES ('${token}', '${owner}', ${Date.now()})`;
};

export const _getNFTsByOwner = (owner: string): string => {
  return `SELECT * FROM owners WHERE _owner = '${owner}'`;
};

export const _getUserNFTs = (tokens: Array<string>): Array<string> => {
  const nfts: Array<string> = [];
  tokens.forEach((token: string): void => {
    nfts.push(`SELECT * FROM nfts WHERE __token__ = '${token}'`);
  });
  return nfts;
};

export const _getAllNFTs = (): string => {
  return `SELECT * FROM nfts`;
};

export const _getMapNFTs = (latitude: number, longitude: number): string => {
  return `SELECT * FROM nfts WHERE ( _maxlat >= ${latitude} AND _minlat <= ${latitude} AND _maxlon >= ${longitude} AND _minlon <= ${longitude} ) OR ( _maxlat = 0)`;
};

export const _updateNFTOwner = (token: string, newOwner: string): string => {
  return `UPDATE nfts SET _owner = ${newOwner} WHERE __token__ = '${token}'`;
};

export const _updateNFTLikes = (token: string, likes: number) => {
  return `UPDATE nfts SET _likes = ${likes} WHERE __token__ = '${token}'`;
};

export const _createNFTtransactions = (token: string): string => {
  return `CREATE TABLE _${token}_ (${transactionsSchema})`;
};

export const _getNFTCounter = () => {
  return `SELECT * from counter`;
};

export const _addNFTCounter = () => {
  return `UPDATE counter SET _n = _n + 1, _timestamp = ${Date.now()}`;
};

export const _getNFTsLength = () => {
  return `SELECT COUNT(__t_getNFTsByOwneroken__) FROM nfts`;
};

export const _newNFTtransactions = (
  token: string,
  owner: string,
  pubkey: string,
  type: string,
  currency: string,
  amount: number,
  hash: string = ""
): string => {
  if (type === "BID")
    return `INSERT INTO _${token}_ (${transactionsSchema}) VALUES ('${owner}', '${pubkey}', '${type}', '${currency}', ${amount}, '', ${Date.now()}`;
  else if (type === "ASK")
    return `INSERT INTO ${token} (${transactionsSchema}) VALUES ('${pubkey}', '${owner}', '${type}', '${currency}', ${amount}, ${hash}, ${Date.now()}`;
  else {
    console.log("Bad type. Type can only BID or ASK");
    return "BAD REQUEST";
  }
};
