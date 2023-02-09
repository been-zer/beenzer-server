// Tables initialization with column types
export const nftInit =
  "_id_ BIGINT NOT NULL UNIQUE, __token__ VARCHAR(255) PRIMARY KEY, _supply INT, _floor FLOAT, _ccy VARCHAR(10), _creator VARCHAR(255), _username VARCHAR(255), _image VARCHAR(255), _asset VARCHAR(255), _type VARCHAR(25), _metadata VARCHAR(255), _name VARCHAR(255), _description VARCHAR(2048), _city VARCHAR(75), _latitude DOUBLE PRECISION, _longitude DOUBLE PRECISION,  _visibility VARCHAR(55), _maxLat DOUBLE PRECISION, _minLat DOUBLE PRECISION, _maxLon DOUBLE PRECISION, _minLon DOUBLE PRECISION, _date VARCHAR(22), _time VARCHAR(22), _timestamp BIGINT";
export const editionInit =
  "__token__ VARCHAR(255), __edition__ INT, _owner VARCHAR(255), _created_at BIGINT, _timestamp BIGINT, PRIMARY KEY (__token__, __edition__)";
export const counterInit = "_n BIGINT, _timestamp BIGINT";
export const ownersInit =
  "_token VARCHAR(255), _owner VARCHAR(255), _timestamp BIGINT";
export const transactionsInit =
  "_owner VARCHAR(255),_pubkey VARCHAR(255), _type VARCHAR(5), _currency VARCHAR(5), _amount FLOAT, _hash VARCHAR(255), _timestamp BIGINT";
// Tables schemas (columns)
export const nftSchema =
  "_id_, __token__, _supply, _floor, _ccy, _creator, _username, _image, _asset, _type, _metadata, _name, _description,	_city, _latitude, _longitude, _visibility, _maxLat, _minLat, _maxLon, _minLon, _date, _time, _timestamp";
export const editionSchema =
  "__token__, __edition__, _owner, _created_at, _timestamp";
export const counterSchema = "_n, _timestamp";
export const ownerSchema = "_token, _owner, _timestamp";
export const transactionsSchema =
  "_owner,	_pubkey, _type, _currency, _amount, _hash, _timestamp ";
