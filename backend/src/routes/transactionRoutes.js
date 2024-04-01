import { Router } from 'express';
import transactionController from '../controllers/transactionController.js';

const router = Router();

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getAllTransactions);

export default router;
