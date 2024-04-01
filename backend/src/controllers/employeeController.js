import employeeService from '../services/employeeService.js';

class EmployeeController {
  async createEmployee(req, res) {
    try {
      const employee = await employeeService.createEmployee(req.body);
      return res.json(employee);
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ message: 'Error creating employee' });
    }
  }

  async getAllEmployees(req, res) {
    try {
      const employees = await employeeService.getAllEmployees();
      return res.json(employees);
    } catch (error) {
      console.error('Error getting employees:', error);
      res.status(500).json({ message: 'Error getting employees' });
    }
  }

  async updateEmployee(req, res) {
    try {
      const updatedEmployee = await employeeService.updateEmployee(req.body);

      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      return res.json(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ message: 'Error updating employee' });
    }
  }

  async deleteEmployee(req, res) {
    try {
      const deletedEmployee = await employeeService.deleteEmployee(
        req.params.wallet_address,
      );

      if (!deletedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      return res.json(deletedEmployee);
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ message: 'Error deleting employee' });
    }
  }
}

export default new EmployeeController();
