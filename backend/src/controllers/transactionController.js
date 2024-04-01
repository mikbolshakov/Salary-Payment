import transactionService from '../services/transactionService.js';

class TransactionController {
  async createTransaction(req, res) {
    try {
      const transaction = await transactionService.createTransaction(req.body);
      return res.json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ message: 'Error creating transaction' });
    }
  }

  async getAllTransactions(req, res) {
    try {
      const transactions = await transactionService.getAllTransactions();
      return res.json(transactions);
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ message: 'Error getting transactions' });
    }
  }
}

export default new TransactionController();
