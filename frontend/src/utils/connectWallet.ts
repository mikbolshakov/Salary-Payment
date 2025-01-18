import { CHAIN_ID, CHAIN_PARAMS } from '../components/connect/connectionConfig';

export const connectWalletHandler = async (
  setMetaMaskConnected: (connected: boolean) => void,
  setWalletAddress: (address: string) => void,
) => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }

      //   const currentChainId = await window.ethereum.request({
      //     method: 'eth_chainId',
      //   });

      //   if (currentChainId !== CHAIN_ID) {
      //     try {
      //       await window.ethereum.request({
      //         method: 'wallet_switchEthereumChain',
      //         params: [{ chainId: CHAIN_ID }],
      //       });
      //     } catch (error: any) {
      //       if (error.code === 4902) {
      //         try {
      //           await window.ethereum.request({
      //             method: 'wallet_addEthereumChain',
      //             params: CHAIN_PARAMS,
      //           });
      //         } catch (addChainError: any) {
      //           console.log('Adding BSC chain error:', addChainError.message);
      //           return;
      //         }
      //       } else {
      //         console.log('Switching to BSC chain error:', error.message);
      //         return;
      //       }
      //     }
      //   }

      setMetaMaskConnected(true);
    } catch (connectError: any) {
      console.log('MetaMask connecting error:', connectError.message);
    }
  } else {
    alert('Please, install MetaMask extension');
  }
};
