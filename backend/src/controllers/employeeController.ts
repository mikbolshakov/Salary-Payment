import { Request, Response } from 'express';
import employeeService from '../services/employeeService';

class EmployeeController {
  async createEmployee(req: Request, res: Response): Promise<Response> {
    try {
      const employee = await employeeService.createEmployee(req.body);
      return res.status(201).json(employee);
    } catch (error) {
      console.error('Error creating employee:', (error as Error).message);
      return res.status(500).json({ message: 'Error creating employee' });
    }
  }

  async getEmployees(req: Request, res: Response): Promise<Response> {
    try {
      let employees = await employeeService.getEmployees();
      employees = employees.reverse();
      return res.status(200).json(employees);
    } catch (error) {
      console.error('Error getting employees:', (error as Error).message);
      return res.status(500).json({ message: 'Error getting employees' });
    }
  }

  async updateSalary(req: Request, res: Response): Promise<Response> {
    try {
      const updatedEmployee = await employeeService.updateSalary(req.body);
      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      return res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee salary:', (error as Error).message);
      return res.status(500).json({ message: 'Error updating employee salary' });
    }
  }

  async updateBonus(req: Request, res: Response): Promise<Response> {
    try {
      const updatedEmployee = await employeeService.updateBonus(req.body);
      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      return res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee bonus:', (error as Error).message);
      return res.status(500).json({ message: 'Error updating employee bonus' });
    }
  }

  async updatePenalty(req: Request, res: Response): Promise<Response> {
    try {
      const updatedEmployee = await employeeService.updatePenalty(req.body);
      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      return res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee penalty:', (error as Error).message);
      return res.status(500).json({ message: 'Error updating employee penalty' });
    }
  }

  async deleteEmployee(req: Request, res: Response): Promise<Response> {
    try {
      const { wallet_address } = req.params;
      const deletedEmployee = await employeeService.deleteEmployee(wallet_address);
      if (!deletedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      return res.status(200).json(deletedEmployee);
    } catch (error) {
      console.error('Error deleting employee:', (error as Error).message);
      return res.status(500).json({ message: 'Error deleting employee' });
    }
  }
}

export default new EmployeeController();
