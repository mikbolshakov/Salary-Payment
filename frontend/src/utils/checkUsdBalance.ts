import axios from 'axios';
import { ethers } from 'ethers';
import { mainAdmin } from '../components/payment/adminsConfig';

const provider = new ethers.JsonRpcProvider(
  process.env.REACT_APP_BSC_MAINNET_URL as string,
);

export const checkUsdBalance = async (): Promise<string | undefined> => {
  try {
    const balance = await provider.getBalance(mainAdmin);
    const bnbBalance = parseFloat(ethers.formatEther(balance));

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BALANCE_API}/simple/price?ids=binancecoin&vs_currencies=usd`,
      );
      const bnbUsdPrice = response.data?.binancecoin?.usd;

      if (bnbUsdPrice) {
        const formattedBalance = (bnbBalance * bnbUsdPrice).toFixed(2);
        return formattedBalance;
      } else {
        console.error('Invalid response for BNB price');
      }
    } catch (error) {
      console.error('Error fetching BNB price:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    alert('Error fetching wallet balance');
    throw error;
  }
};
