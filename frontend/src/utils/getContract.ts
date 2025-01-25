import { ethers } from 'ethers';
import contractAbi from '../ABI/contractAbi.json';
import { CONTRACT_ADDRESS } from '../constants/constants';

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractAbi,
    await signer,
  );

  return contract;
};
