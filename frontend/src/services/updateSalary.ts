import axios from 'axios';
import { parseUnits } from 'ethers';
import { getContract } from '../utils/getContract';
import { GAS_LIMIT } from '../constants/constants';

export const handleUpdateSalary = async (
  walletAddress: string,
  editSalary: string,
  onClose: () => void,
  setLoading: (loading: boolean) => void,
) => {
  setLoading(true);

  try {
    const contract = await getContract();

    const tx = await contract.setEmployeeSalary(
      walletAddress,
      parseUnits(editSalary.toString(), 18),
      { gasLimit: GAS_LIMIT },
    );

    const receipt = await tx.wait();

    if (receipt?.status !== 1) {
      console.error('Transaction on the smart contract failed');
      alert('Transaction on the smart contract failed');
      return;
    }

    await axios.put(`${process.env.REACT_APP_API_URL}/employees/salary`, {
      wallet_address: walletAddress,
      salary: editSalary,
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
      console.error('Failed to update salary for employee:', error);
      alert('Smart contract limitations or other error');
    }
  } finally {
    setLoading(false);
  }
};
