import { Request, Response } from 'express';
import transactionService from '../services/transactionService';

class TransactionController {
  async createTransaction(req: Request, res: Response): Promise<Response> {
    try {
      const transaction = await transactionService.createTransaction(req.body);
      return res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', (error as Error).message);
      return res.status(500).json({ message: 'Error creating transaction' });
    }
  }

  async getTransactions(req: Request, res: Response): Promise<Response> {
    try {
      const transactions = await transactionService.getTransactions();
      return res.status(200).json(transactions);
    } catch (error) {
      console.error('Error getting transactions:', (error as Error).message);
      return res.status(500).json({ message: 'Error getting transactions' });
    }
  }
}

export default new TransactionController();
