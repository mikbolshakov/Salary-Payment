import { Router } from 'express';
import transactionController from '../controllers/transactionController';

const router = Router();

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);

export default router;
