import { Employee } from '../Employee';

export interface AddEmployeeModalProps {
  employees: Employee[];
  onClose: () => void;
}
