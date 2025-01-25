import { ethers } from 'ethers';

export const GAS_LIMIT = 250000;

export const CONTRACT_ADDRESS = '0xAe8eE9746cB36523604fcfCE946B367DF4056951';
export const TOKEN_ADDRESS = '0x2472eAf4728C3633c10CB460A59B6762cdd5e9D5';
export const ADMIN = '0x6ae19a226A6Cec3E29D5dfC90C2bd6640d8d77b9';

export const CONTRACT_EXPLORER_LINK =
  'https://sepolia.etherscan.io/address/0xae8ee9746cb36523604fcfce946b367df4056951';
export const COINGECKO_API_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
export const PROVIDER = new ethers.JsonRpcProvider(
  process.env.REACT_APP_ETH_SEPOLIA_URL as string,
);

export const CHAIN_ID = '0xAA36A7';
export const CHAIN_PARAMS = [
  {
    chainId: CHAIN_ID,
    chainName: 'Sepolia',
    rpcUrls: ['https://sepolia.drpc.org'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
];

export const shortAddress = (address: string | null | undefined): string => {
  return address ? `${address.slice(0, 6)}...${address.slice(-5)}` : '';
};
