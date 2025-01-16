import { Router } from 'express';
import employeeController from '../controllers/employeeController';

const router = Router();

router.get('/', employeeController.getEmployees);
router.post('/', employeeController.createEmployee);
router.put('/salary', employeeController.updateSalary);
router.put('/bonus', employeeController.updateBonus);
router.put('/penalty', employeeController.updatePenalty);
router.delete('/:wallet_address', employeeController.deleteEmployee);

export default router;
