import { Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { parseUnits } from 'ethers';
import { validateForm } from '../utils/validateForm';
import { getContract } from '../utils/getContract';
import { Employee } from '../interfaces/Employee';
import { GAS_LIMIT } from '../constants/constants';

export const handleAddEmployee = async (
  newEmployee: Employee,
  employees: Employee[],
  setError: Dispatch<SetStateAction<string>>,
  setLoading: (loading: boolean) => void,
  onClose: () => void,
) => {
  if (!validateForm(newEmployee, employees, setError)) return;
  setLoading(true);

  try {
    const contract = await getContract();
    const tx = await contract.addEmployee(
      newEmployee.wallet_address,
      parseUnits(newEmployee.salary, 18),
      { gasLimit: GAS_LIMIT },
    );

    const receipt = await tx.wait();

    if (receipt?.status !== 1) {
      console.error('Transaction on the smart contract failed');
      alert('Transaction on the smart contract failed');
      return;
    }

    await axios.post(`${process.env.REACT_APP_API_URL}/employees`, newEmployee);

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
      console.error('Failed to add employee:', error);
      alert('Smart contract limitations or other error');
    }
  } finally {
    setLoading(false);
  }
};
