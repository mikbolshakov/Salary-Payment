import { QueryResult } from 'pg';
import employeePool from '../sql/salaryDb';

interface Employee {
  full_name: string;
  wallet_address: string;
  salary: number;
  bonus?: number;
  penalty?: number;
}

class EmployeeService {
  async createEmployee(employee: Employee): Promise<QueryResult<Employee>> {
    const { full_name, wallet_address, salary } = employee;
    const query = `
      INSERT INTO employees (full_name, wallet_address, salary, bonus, penalty)
      VALUES ($1, $2, $3, 0, 0)
      RETURNING *;
    `;
    const values = [full_name, wallet_address, salary];
    const createdEmployee = await employeePool.query(query, values);
    return createdEmployee;
  }

  async getEmployees(): Promise<Employee[]> {
    const { rows } = await employeePool.query('SELECT * FROM employees');
    return rows;
  }

  async updateSalary(employee: {
    salary: number;
    wallet_address: string;
  }): Promise<Employee | null> {
    const { salary, wallet_address } = employee;
    const query = `
      UPDATE employees 
      SET salary = $1
      WHERE wallet_address = $2
      RETURNING *;
    `;
    const values = [salary, wallet_address];
    const updatedEmployee = await employeePool.query(query, values);
    return updatedEmployee.rows[0] || null;
  }

  async updateBonus(employee: { bonus: number; wallet_address: string }): Promise<Employee | null> {
    const { bonus, wallet_address } = employee;
    const query = `
      UPDATE employees 
      SET bonus = $1
      WHERE wallet_address = $2
      RETURNING *;
    `;
    const values = [bonus, wallet_address];
    const updatedEmployee = await employeePool.query(query, values);
    return updatedEmployee.rows[0] || null;
  }

  async updatePenalty(employee: {
    penalty: number;
    wallet_address: string;
  }): Promise<Employee | null> {
    const { penalty, wallet_address } = employee;
    const query = `
      UPDATE employees 
      SET penalty = $1 
      WHERE wallet_address = $2
      RETURNING *;
    `;
    const values = [penalty, wallet_address];
    const updatedEmployee = await employeePool.query(query, values);
    return updatedEmployee.rows[0] || null;
  }

  async deleteEmployee(wallet_address: string): Promise<Employee | null> {
    const query = `
      DELETE FROM employees
      WHERE wallet_address = $1
      RETURNING *;
    `;
    const deletedEmployee = await employeePool.query(query, [wallet_address]);
    return deletedEmployee.rows[0] || null;
  }
}

export default new EmployeeService();
