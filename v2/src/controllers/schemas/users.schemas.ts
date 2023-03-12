// Tables initialization with column types
export const usersInit =
  "__pubkey__ VARCHAR(255) PRIMARY KEY, _username_ VARCHAR(55) UNIQUE, _pfp VARCHAR(555), _name VARCHAR(55), _lastname VARCHAR(55), _description VARCHAR(255), _birthdate VARCHAR(55),  _country VARCHAR(155), _flag  VARCHAR(10), _city VARCHAR(155), _phone VARCHAR(55), _email VARCHAR(55), _verified BOOLEAN, _twitter VARCHAR(55), _instagram VARCHAR(55), _discord VARCHAR(55), _telegram VARCHAR(55), _youtube VARCHAR(55), _tiktok VARCHAR(55), _magiceden VARCHAR(55), _opensea VARCHAR(55), _appuser BOOLEAN, _created_at BIGINT, _timestamp BIGINT";
export const logsInit =
  "_pubkey VARCHAR(255), _logs VARCHAR(255), _timestamp BIGINT";
export const friendsInit =
  "__pubkey__ VARCHAR(255), __pubkey2__ VARCHAR(255), _timestamp BIGINT, PRIMARY KEY (__pubkey__, __pubkey2__)";
// Tables schemas (columns)
export const usersSchema =
  "__pubkey__ , _username_, _pfp, _name, _lastname, _description, _birthdate, _country, _flag, _city, _phone, _email, _verified, _twitter, _instagram, _discord, _telegram, _youtube, _tiktok, _magiceden, _opensea, _appuser, _created_at, _timestamp";
export const logsSchema = "_pubkey , _logs, _timestamp";
export const friendsSchema = "__pubkey__, __pubkey2__, _timestamp";
