import { Router } from 'express';
import employeeController from '../controllers/employeeController.js';

const router = Router();

router.get('/', employeeController.getAllEmployees);
router.post('/', employeeController.createEmployee);
router.put('/', employeeController.updateEmployee);
router.delete('/:wallet_address', employeeController.deleteEmployee);

export default router;
