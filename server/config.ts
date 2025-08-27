import { config } from 'dotenv';

config();

export const ENV = {
  PINATA_GATEWAY: process.env.PINATA_GATEWAY,
  RPC_URL: process.env.RPC_URL || 'https://api.devnet.solana.com',
  NETWORK: process.env.NETWORK || 'devnet',
  WALLET_SECRET_KEY: process.env.WALLET_SECRET_KEY || '',
  NFT_SYMBOL: process.env.NFT_SYMBOL || 'OWN',
  SELLER_FEE_BPS: parseInt(process.env.SELLER_FEE_BPS || '0'),
  PORT: parseInt(process.env.PORT || '3001'),
  MOCK_MODE: process.env.MOCK_MODE === 'true',
  BUNDLR_URL: process.env.BUNDLR_URL || 'https://devnet.bundlr.network'
};

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (ENV.MOCK_MODE) {
    return { valid: true, errors: [] };
  }

  if (!ENV.WALLET_SECRET_KEY) {
    errors.push('WALLET_SECRET_KEY is required');
  }

  if (!ENV.RPC_URL) {
    errors.push('RPC_URL is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getExplorerUrl(signature: string, type: 'tx' | 'address' = 'tx'): string {
  const cluster = ENV.NETWORK === 'mainnet-beta' ? '' : `?cluster=${ENV.NETWORK}`;
  return `https://explorer.solana.com/${type}/${signature}${cluster}`;
}