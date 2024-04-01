import employeePool from '../sql/employeesDb.js';

class EmployeeService {
  async createEmployee(employee) {
    const { full_name, wallet_address, salary, bonus, penalty } = employee;
    const query = `
    INSERT INTO employees (full_name, wallet_address, salary, bonus, penalty)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
    const values = [full_name, wallet_address, salary, bonus, penalty];
    const createdEmployee = await employeePool.query(query, values);
    return createdEmployee;
  }

  async getAllEmployees() {
    const { rows } = await employeePool.query('SELECT * FROM employees');
    return rows;
  }

  async updateEmployee(employee) {
    const { full_name, salary, bonus, penalty } = employee;
    const query = `
      UPDATE employees 
      SET full_name = $1, salary = $2, bonus = $3, penalty = $4 
      WHERE wallet_address = $5
      RETURNING *;
    `;
    const values = [full_name, salary, bonus, penalty, employee.wallet_address];
    const updatedEmployee = await employeePool.query(query, values);
    return updatedEmployee;
  }

  async deleteEmployee(wallet_address) {
    const query = `
        DELETE FROM employees
        WHERE wallet_address = $1
        RETURNING *;
      `;
    const deletedEmployee = await employeePool.query(query, [wallet_address]);
    return deletedEmployee;
  }
}

export default new EmployeeService();
