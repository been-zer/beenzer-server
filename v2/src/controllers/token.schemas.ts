// Tables initialization with column types
export const transactionsInit = '_date VARCHAR(20), _time VARCHAR(20), _type VARCHAR(10), _amount FLOAT, _pubkey VARCHAR(255), _flag VARCHAR(10), _timestamp BIGINT';
export const holdersInit = '__position__ INT PRIMARY KEY, _percentage FLOAT, _amount FLOAT, _pubkey VARCHAR(255), _flag VARCHAR(10), _timestamp BIGINT';
// Tables schemas (columns)
export const transactionsSchema = '_date VARCHAR(20), _time VARCHAR(20), _type VARCHAR(10), _amount FLOAT, _pubkey VARCHAR(255), _flag VARCHAR(10), _timestamp BIGINT';
export const holdersSchema = '__position__, _percentage, _amount, _pubkey, _flag, _timestamp';
