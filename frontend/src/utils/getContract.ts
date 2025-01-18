import { ethers } from 'ethers';
import contractAbi from '../ABI/contractAbi.json';

const contractAddress = process.env.REACT_APP_SALARY_CONTRACT_ADDRESS as string;

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(
    contractAddress,
    contractAbi,
    await signer,
  );

  return contract;
};
