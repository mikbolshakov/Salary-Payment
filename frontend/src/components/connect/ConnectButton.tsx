import { useState } from 'react';
import { shortAddress } from './connectionConfig';
import { connectWalletHandler } from '../../utils/connectWallet';
import './ConnectButton.css';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      disconnect?: () => void;
    };
  }
}

function ConnectButton() {
  const [metaMaskConnected, setMetaMaskConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  const disconnectWalletHandler = () => {
    setMetaMaskConnected(false);
    setWalletAddress('');
  };

  return (
    <>
      <button
        className={`connect__button ${metaMaskConnected ? 'connect__button--connected' : ''}`}
        onClick={
          metaMaskConnected
            ? disconnectWalletHandler
            : () => connectWalletHandler(setMetaMaskConnected, setWalletAddress)
        }
      >
        {metaMaskConnected ? shortAddress(walletAddress) : 'Connect MetaMask'}
      </button>
    </>
  );
}

export default ConnectButton;
