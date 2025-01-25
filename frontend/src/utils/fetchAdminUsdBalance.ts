import axios from 'axios';
import { ethers } from 'ethers';
import { ADMIN, COINGECKO_API_URL, PROVIDER } from '../constants/constants';

export const fetchAdminUsdBalance = async (): Promise<string | undefined> => {
  try {
    const balance = await PROVIDER.getBalance(ADMIN);
    const etherBalance = parseFloat(ethers.formatEther(balance));

    try {
      const response = await axios.get(COINGECKO_API_URL);
      const etherUsdPrice = response.data?.ethereum?.usd;

      if (etherUsdPrice) {
        const formattedBalance = (etherBalance * etherUsdPrice).toFixed(2);
        return formattedBalance;
      } else {
        console.error('Invalid response for ETH price');
      }
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    alert('Error fetching wallet balance');
    throw error;
  }
};
