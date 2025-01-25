import axios from 'axios';
import { parseUnits } from 'ethers';
import { getContract } from '../utils/getContract';
import { GAS_LIMIT } from '../constants/constants';

export const handleUpdateBonus = async (
  walletAddress: string,
  editBonus: string,
  onClose: () => void,
  setLoading: (loading: boolean) => void,
) => {
  setLoading(true);

  try {
    const contract = await getContract();

    const tx = await contract.setEmployeeBonus(
      walletAddress,
      parseUnits(editBonus.toString(), 18),
      { gasLimit: GAS_LIMIT },
    );

    const receipt = await tx.wait();

    if (receipt?.status !== 1) {
      console.error('Transaction on the smart contract failed');
      alert('Transaction on the smart contract failed');
      return;
    }

    await axios.put(`${process.env.REACT_APP_API_URL}/employees/bonus`, {
      wallet_address: walletAddress,
      bonus: editBonus,
    });

    onClose();
    window.location.reload();
  } catch (error: any) {
    if (error.response) {
      console.error(
        'Error making request to the database:',
        error.response.data,
      );
      alert('Error interacting with the database');
    } else {
      console.error('Failed to update bonus for employee:', error);
      alert('Smart contract limitations or other error');
    }
  } finally {
    setLoading(false);
  }
};
