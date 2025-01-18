import { Employee } from '../Employee';

export interface EmployeeTableProps {
  employees: Employee[];
  searchQuery: string;
  searchWalletQuery: string;
  onEdit: (wallet_address: string) => void;
}
