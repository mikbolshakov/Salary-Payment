import { ethers } from 'ethers';
import tokenAbi from '../ABI/tokenAbi.json';
import {
  CONTRACT_ADDRESS,
  PROVIDER,
  TOKEN_ADDRESS,
} from '../constants/constants';

export const fetchContractBalance = async (): Promise<string | undefined> => {
  try {
    const tokenContract = new ethers.Contract(
      TOKEN_ADDRESS,
      tokenAbi,
      PROVIDER,
    );
    const balance = await tokenContract.balanceOf(CONTRACT_ADDRESS);
    const formattedBalance = ethers.formatUnits(balance, 18);

    return formattedBalance;
  } catch (error) {
    console.error('Error displaying smart contract balance:', error);
    alert('Error displaying smart contract balance');
    throw error;
  }
};
