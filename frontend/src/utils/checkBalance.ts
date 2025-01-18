import { ethers } from 'ethers';
import tokenAbi from '../ABI/tokenAbi.json';

const contractAddress = process.env.REACT_APP_SALARY_CONTRACT_ADDRESS as string;
const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS as string;
const provider = new ethers.JsonRpcProvider(
  process.env.REACT_APP_BSC_MAINNET_URL as string,
);

export const checkBalance = async (): Promise<string | undefined> => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
    const balance = await tokenContract.balanceOf(contractAddress);
    const formattedBalance = ethers.formatUnits(balance, 18);

    return formattedBalance;
  } catch (error) {
    console.error('Error displaying smart contract balance:', error);
    alert('Error displaying smart contract balance');
    throw error;
  }
};
