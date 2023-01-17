// Tables initialization with column types
export const nftInit =
  "_id_ BIGINT NOT NULL UNIQUE, __token__ VARCHAR(255) PRIMARY KEY, _supply INT, _creator VARCHAR(255), _username VARCHAR(255), _asset VARCHAR(255), _type VARCHAR(25), _description VARCHAR(2048), _city VARCHAR(75), _latitude FLOAT, _longitude FLOAT, _distance VARCHAR(55), _maxLat VARCHAR(255), _minLat VARCHAR(255), _maxLon VARCHAR(255), _minLon VARCHAR(255), _date VARCHAR(22), _time VARCHAR(22), _timestamp BIGINT";
export const counterInit = "_n BIGINT, _timestamp BIGINT";
export const ownersInit =
  " _token VARCHAR(255), _owner VARCHAR(255), _timestamp BIGINT";
export const transactionsInit =
  "_owner VARCHAR(255),_pubkey VARCHAR(255), _type VARCHAR(5), _currency VARCHAR(5), _amount FLOAT, _hash VARCHAR(255), _timestamp BIGINT";
// Tables schemas (columns)
export const nftSchema =
  "_id_, __token__, _supply, _creator, _username, _asset, _type, _description,	_city, _latitude, _longitude, _distance, _maxLat, _minLat, _maxLon, _minLon, _date, _time, _timestamp";
export const counterSchema = "_n, _timestamp";
export const ownerSchema = "_token, _owner, _timestamp";
export const transactionsSchema =
  "_owner,	_pubkey, _type, _currency, _amount, _hash, _timestamp ";
