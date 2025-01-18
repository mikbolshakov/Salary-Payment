import { Employee } from '../interfaces/Employee';

export const validateForm = (
  newEmployee: Employee,
  employees: Employee[],
  setError: React.Dispatch<React.SetStateAction<string>>,
): boolean => {
  const { full_name, wallet_address, salary } = newEmployee;

  if (!full_name.trim()) {
    setError("Please enter the employee's full name");
    return false;
  }

  if (employees.some((employee) => employee.full_name === full_name)) {
    setError('An employee with this name already exists');
    return false;
  }

  if (!wallet_address.trim()) {
    setError("Please enter the employee's wallet address");
    return false;
  }

  if (!wallet_address.startsWith('0x') || wallet_address.length !== 42) {
    setError('Wallet address must start with "0x" and be 42 characters long');
    return false;
  }

  if (!salary.trim()) {
    setError("Please enter the employee's salary");
    return false;
  }

  if (isNaN(+salary)) {
    setError('Salary must be a valid number');
    return false;
  }

  setError('');
  return true;
};
