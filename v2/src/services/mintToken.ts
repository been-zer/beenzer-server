// mintToken.ts
// import payer_secret from '../keys/payer.json'
// import secret from '../keys/mint.json';
import { 
	Connection, 
	PublicKey, 
	Keypair
} from '@solana/web3.js';
import { 
	mintTo,
} from '@solana/spl-token';
import dotenv from 'dotenv';
dotenv.config();

export const mintToken = async (_amount: number = 1) => {
	const payer_secret =  String(process.env.MASTER_WALLET_KEYPAIR).split(',') as any;
	const mint_secret = String(process.env.TOKEN_AUTHORITY).split(',') as any;
	const SOLANA_RPC_URL: string = process.env.SOLANA_RPC_URL as string;
	const SOLANA_CONNECTION: Connection = new Connection(SOLANA_RPC_URL as string);
	const TOKEN: PublicKey = new PublicKey(process.env.TOKEN as string);
	const TOKEN_ACCOUNT: PublicKey = new PublicKey(process.env.TOKEN_ACCOUNT as string);
	const PAYER = Keypair.fromSecretKey(new Uint8Array(payer_secret));
	const MINT = Keypair.fromSecretKey(new Uint8Array(mint_secret));
	const decimals = 2;
	
	// Mint token
	const signature = await mintTo(
		SOLANA_CONNECTION,
		PAYER,
		TOKEN,
		TOKEN_ACCOUNT,
		MINT,
		_amount * Math.pow(10, decimals)
	);

	console.log(`Mint signature: ${signature}`);
}

mintToken();

// v 1.0