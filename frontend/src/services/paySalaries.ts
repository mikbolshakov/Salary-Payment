import axios from 'axios';
import { getContract } from '../utils/getContract';
import { Employee } from '../interfaces/Employee';

export const paySalaries = async (
  employees: Employee[],
  totalPayout: number,
) => {
  try {
    const contract = await getContract();
    const tx = await contract.paySalary({
      gasLimit: 2000000,
    });
    const receipt = await tx.wait();

    if (receipt?.status !== 1) {
        console.error('Transaction on the smart contract failed');
        alert('Transaction on the smart contract failed');
      return;
    }

    const formattedDate = new Date().toISOString().split('T')[0];
    const explorerLink = `https://bscscan.com/tx/${receipt.hash}`;

    const transactionData = {
      date: formattedDate,
      amount: totalPayout,
      hash: explorerLink,
    };

    await axios.post(
      `${process.env.REACT_APP_API_URL}/transactions`,
      transactionData,
    );

    const employeeRequests = employees.map((employee) => {
      const data = {
        wallet_address: employee.wallet_address,
        salary: employee.salary,
        bonus: 0,
        penalty: 0,
      };

      return Promise.all([
        axios.put(`${process.env.REACT_APP_API_URL}/employees/bonus`, data),
        axios.put(`${process.env.REACT_APP_API_URL}/employees/penalty`, data),
      ]);
    });

    await Promise.all(employeeRequests);
    alert('Successfully paid');
    window.location.reload();
  } catch (error: any) {
    if (error.response) {
      console.error(
        'Error making request to the database:',
        error.response.data,
      );
      alert('Error interacting with the database');
    } else {
      console.error('Failed to pay salaries:', error);
      alert('Smart contract limitations or other error');
    }
  }
};
