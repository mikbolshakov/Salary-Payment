import { Router } from 'express';
import employeeRouter from './employeeRoutes.js';
import transactionRouter from './transactionRoutes.js';
const router = Router();

router.use('/employees', employeeRouter);
router.use('/transactions', transactionRouter);

export default router;
