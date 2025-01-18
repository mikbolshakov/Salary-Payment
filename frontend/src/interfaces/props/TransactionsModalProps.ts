import { Transaction } from '../Transaction';

export interface TransactionsModalProps {
  transactions: Transaction[];
  onClose: () => void;
}
