export interface PaymentProps {
  totalPayout: number;
  tokenBalance: number;
  paySalaries: () => void;
  getTransactions: () => void;
  usdBalance: number;
}
