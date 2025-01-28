import { Ed25519Keypair } from '@0xobelisk/sui-client';

// 直接使用 process.env，Next.js 会在构建时处理环境变量
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
if (!PRIVATE_KEY) {
    throw new Error('NEXT_PUBLIC_PRIVATE_KEY environment variable is required in .env file');
}

const keypair = Ed25519Keypair.fromSecretKey(PRIVATE_KEY);
const ADDRESS = keypair.getPublicKey().toSuiAddress();

export { PRIVATE_KEY, ADDRESS };
