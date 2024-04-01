import transactionPool from '../sql/transactionsDb.js';

class TransactionService {
  async createTransaction(transaction) {
    const { date, amount, hash } = transaction;
    const query = `
    INSERT INTO transactions (date, amount, hash)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
    const values = [date, amount, hash];
    const createdTransaction = await transactionPool.query(query, values);
    return createdTransaction;
  }

  async getAllTransactions() {
    const { rows } = await transactionPool.query('SELECT * FROM transactions');
    return rows;
  }
}

export default new TransactionService();
