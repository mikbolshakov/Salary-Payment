import { Router } from 'express';
import employeeRouter from './employeeRoutes';
import transactionRouter from './transactionRoutes';

const router = Router();

router.use('/employees', employeeRouter);
router.use('/transactions', transactionRouter);

export default router;
