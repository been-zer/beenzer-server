// Tables initialization with column types
export const userInit = '__pubkey__ VARCHAR(255) PRIMARY KEY, _username_ VARCHAR(55) UNIQUE, _pfp VARCHAR(555), _name VARCHAR(55), _lastname VARCHAR(55), _description VARCHAR(255), _birthdate VARCHAR(55), _phone VARCHAR(55), _email VARCHAR(55), _verified BOOLEAN, _twitter VARCHAR(55), _instagram VARCHAR(55), _tiktok VARCHAR(55), _magiceden VARCHAR(55), _opensea VARCHAR(55), _created_at BIGINT, _timestamp BIGINT';
export const nftInit = '_id_ BIGINT NOT NULL UNIQUE, __token__ VARCHAR(255) PRIMARY KEY, _supply INT, _creator VARCHAR(255), _username VARCHAR(255), _asset VARCHAR(255), _type VARCHAR(25), _description VARCHAR(2048), _city VARCHAR(75), _latitude FLOAT, _longitude FLOAT, _date VARCHAR(22), _time VARCHAR(22), _timestamp BIGINT';
export const counterInit = '_n BIGINT, _timestamp BIGINT';
export const ownersInit = ' _token VARCHAR(255), _owner VARCHAR(255), _timestamp BIGINT';
export const transactionsInit = '_owner VARCHAR(255),_pubkey VARCHAR(255), _type VARCHAR(5), _currency VARCHAR(5), _amount FLOAT, _hash VARCHAR(255), _timestamp BIGINT';
export const followersInit = '__follower__ VARCHAR(255), __user__ VARCHAR(255), _timestamp BIGINT, PRIMARY KEY (__follower__, __user__)';
export const friendsInit = '__pubkey__ VARCHAR(255), __pubkey2__ VARCHAR(255), _timestamp BIGINT, PRIMARY KEY (__pubkey__, __pubkey2__)';
export const messagesInit = '_owner VARCHAR(255), _message VARCHAR(1048), _liked BOOLEAN, _emoji VARCHAR(10), _timestamp BIGINT';
// Tables schemas (columns)
export const userSchema = '__pubkey__ , _username_, _pfp, _name, _lastname, _description, _birthdate, _phone, _email, _verified, _twitter, _instagram, _tiktok, _magiceden, _opensea, _created_at, _timestamp';
export const nftSchema = '_id_, __token__, _supply,	 _creator, _username, _asset, _type, _description,	_city, _latitude, _longitude, _date, _time, _timestamp';
export const counterSchema = '_n, _timestamp';
export const ownerSchema = '_token, _owner, _timestamp'
export const transactionsSchema = '_owner,	_pubkey, _type, _currency, _amount, _hash, _timestamp ';
export const followersSchema = '__follower__, __user__, _timestamp';
export const friendsSchema = '__pubkey__, __pubkey2__, _timestamp';
export const messagesSchema = '_owner, _message, _liked, _emoji, _timestamp';
