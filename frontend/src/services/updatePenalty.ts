import axios from 'axios';
import { parseUnits } from 'ethers';
import { getContract } from '../utils/getContract';
import { GAS_LIMIT } from '../constants/constants';

export const handleUpdatePenalty = async (
  walletAddress: string,
  editPenalty: string,
  onClose: () => void,
  setLoading: (loading: boolean) => void,
) => {
  setLoading(true);

  try {
    const contract = await getContract();

    const tx = await contract.setEmployeePenalty(
      walletAddress,
      parseUnits(editPenalty.toString(), 18),
      { gasLimit: GAS_LIMIT },
    );

    const receipt = await tx.wait();

    if (receipt?.status !== 1) {
      console.error('Transaction on the smart contract failed');
      alert('Transaction on the smart contract failed');
      return;
    }

    await axios.put(`${process.env.REACT_APP_API_URL}/employees/penalty`, {
      wallet_address: walletAddress,
      penalty: editPenalty,
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
      console.error('Failed to update penalty for employee:', error);
      alert('Smart contract limitations or other error');
    }
  } finally {
    setLoading(false);
  }
};
