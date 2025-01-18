export interface EditEmployeeModalProps {
  walletAddress: string;
  initialSalary: string;
  initialBonus: string;
  initialPenalty: string;
  onClose: () => void;
}
