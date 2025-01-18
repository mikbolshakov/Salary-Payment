import { EmployeeTableProps } from '../../interfaces/props/EmployeeTableProps';
import './EmployeeTable.css';

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  searchQuery,
  searchWalletQuery,
  onEdit,
}) => {
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      employee.wallet_address
        .toLowerCase()
        .includes(searchWalletQuery.toLowerCase()),
  );

  return (
    <table className="employee-table">
      <thead className="employee-table__header">
        <tr>
          <th className="employee-table__header-cell">Employee</th>
          <th className="employee-table__header-cell">Wallet</th>
          <th className="employee-table__header-cell">Salary</th>
          <th className="employee-table__header-cell">Bonus</th>
          <th className="employee-table__header-cell">Penalty</th>
          <th className="employee-table__header-cell">Payout</th>
          <th className="employee-table__header-cell">Change</th>
        </tr>
      </thead>
      <tbody>
        {filteredEmployees.map((employee, index) => (
          <tr key={index} className="employee-table__row">
            <td className="employee-table__cell">
              <span className="employee-table__cell--label">Employee:</span>
              {employee.full_name}
            </td>
            <td className="employee-table__cell employee-table__cell--wallet">
              <span className="employee-table__cell--label">Wallet:</span>
              {employee.wallet_address}
            </td>
            <td className="employee-table__cell">
              <span className="employee-table__cell--label">Salary:</span>
              {parseInt(employee.salary)}
            </td>
            <td className="employee-table__cell">
              <span className="employee-table__cell--label">Bonus:</span>
              {parseInt(employee.bonus)}
            </td>
            <td className="employee-table__cell">
              <span className="employee-table__cell--label">Penalty:</span>
              {parseInt(employee.penalty)}
            </td>
            <td className="employee-table__cell">
              <span className="employee-table__cell--label">Payout:</span>
              {parseInt(employee.salary) +
                parseInt(employee.bonus) -
                parseInt(employee.penalty)}
            </td>
            <td className="employee-table__cell">
              <button
                className="employee-table__button"
                onClick={() => onEdit(employee.wallet_address)}
              >
                Change
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;
