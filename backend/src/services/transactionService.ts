import transactionPool from '../sql/salaryDb';

interface Transaction {
  date: string;
  amount: number;
  hash: string;
}

class TransactionService {
  async createTransaction(transaction: Transaction): Promise<Transaction> {
    const { date, amount, hash } = transaction;
    const query = `
      INSERT INTO transactions (date, amount, hash)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [date, amount, hash];
    const result = await transactionPool.query(query, values);

    return result.rows[0] as Transaction;
  }

  async getTransactions(): Promise<Transaction[]> {
    const { rows } = await transactionPool.query('SELECT * FROM transactions ORDER BY date DESC');
    return rows as Transaction[];
  }
}

export default new TransactionService();
