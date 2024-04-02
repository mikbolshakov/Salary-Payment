import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import tokenAbi from '../../../ABI/tokenAbi.json';
import './TokenInfo.css';

const TokenInfo = () => {
  const [smartContractBalance, setSmartContractBalance] =
    useState('Loading...');

  useEffect(() => {
    checkBalance();
  }, []);

  const checkBalance = async () => {
    try {
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      const provider = new BrowserProvider(`${process.env.REACT_APP_PROVIDER}`);

      const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
      const tokenContract = new Contract(tokenAddress, tokenAbi, provider);

      const contractTokenBalance = (
        await tokenContract.balanceOf(contractAddress)
      ).toString();
      const frontendBalance = contractTokenBalance / 10 ** 18;
      setSmartContractBalance(frontendBalance);
    } catch (error) {
      console.error('Smart contract balance display error: ', error);
      setSmartContractBalance('Error');
    }
  };

  return (
    <div className="total-payout">
      Smart contract balance: {smartContractBalance}
    </div>
  );
};

export default TokenInfo;
