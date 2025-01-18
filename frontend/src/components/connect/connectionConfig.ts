export const CHAIN_ID = '0x38';

export const CHAIN_PARAMS = [
  {
    chainId: CHAIN_ID,
    chainName: 'Binance Smart Chain',
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorerUrls: ['https://bscscan.com/'],
  },
];

export const shortAddress = (address: string | null | undefined): string => {
  return address ? `${address.slice(0, 6)}...${address.slice(-5)}` : '';
};
