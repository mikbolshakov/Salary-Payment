import { useEffect, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import tokenAbi from '../../ABI/tokenAbi.json';
import axios from 'axios';
import './EmployeeList.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchWalletQuery, setSearchWalletQuery] = useState('');
  const [editEmployeeIndex, setEditEmployeeIndex] = useState(null);
  const [smartContractBalance, setSmartContractBalance] =
    useState('Loading...');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editWalletAddress, setEditWalletAddress] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editBonus, setEditBonus] = useState(0);
  const [editPenalty, setEditPenalty] = useState(0);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    walletAddress: '',
    salary: '',
  });
  const [fieldFocused, setFieldFocused] = useState({
    fullName: false,
    walletAddress: false,
    salary: false,
  });

  useEffect(() => {
    fetchEmployees();
    checkBalance();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + 'employees',
      );
      setEmployees(response.data);
    } catch (error) {
      console.error('Employee display error: ', error);
      alert('Employee display error');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowEditModal(false);
    setNewEmployee({
      fullName: '',
      walletAddress: '',
      salary: '',
    });
    setFieldFocused({
      fullName: false,
      walletAddress: false,
      salary: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: value,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'editSalary') {
      if (!isNaN(Number(value))) {
        setEditSalary(value);
      } else {
        alert('Salary must be a number');
      }
    } else if (name === 'editBonus') {
      if (!isNaN(Number(value))) {
        setEditBonus(value);
      } else {
        alert('Bonus must be a number');
      }
    } else if (name === 'editPenalty') {
      if (!isNaN(Number(value))) {
        setEditPenalty(value);
      } else {
        alert('Penalty must be a number');
      }
    }
  };

  const handleFieldFocus = (fieldName) => {
    setFieldFocused({
      ...fieldFocused,
      [fieldName]: true,
    });
  };

  const handleFieldBlur = (fieldName) => {
    if (newEmployee[fieldName] === '') {
      setFieldFocused({
        ...fieldFocused,
        [fieldName]: false,
      });
    }
  };

  const openEditModal = (walletAddress) => {
    const employee = employees.find(
      (emp) => emp.walletAddress === walletAddress,
    );
    setEditSalary(0);
    setEditBonus(0);
    setEditPenalty(0);
    setEditWalletAddress(walletAddress);
    setShowEditModal(true);
  };

  const checkBalance = async () => {
    try {
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      const provider = new BrowserProvider(`${process.env.REACT_APP_PROVIDER}`);

      const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
      const tokenContract = new Contract(tokenAddress, tokenAbi, provider);

      const contractTokenBalance = (
        await tokenContract.balanceOf(contractAddress)
      ).toString();
      const frontendBalance = contractTokenBalance / 10 ** 18;
      setSmartContractBalance(
        frontendBalance + ` ${process.env.REACT_APP_TOKEN_TIKER}`,
      );
    } catch (error) {
      console.error('Smart contract balance display error: ', error);
      setSmartContractBalance('Error');
    }
  };

  const deleteTheEmployee = async () => {
    const data = {
      walletAddress: editWalletAddress,
    };

    try {
      await axios.delete(
        process.env.REACT_APP_API_URL +
          'stake'`employees/delete?walletAddress=${editWalletAddress}`,
        data,
      );
      fetchEmployees();
    } catch (error) {
      alert('Limitation in a database');
      console.error('Failed to remove employee from database: ', error);
    }

    setShowEditModal(false);
    handleModalClose();
  };

  const saveChanges = async () => {
    try {
      if (editSalary !== 0) {
        const salaryData = {
          walletAddress: editWalletAddress,
        };
        salaryData.salary = editSalary;
        await axios.put(process.env.REACT_APP_API_URL + 'employee', salaryData);
        console.log('Salary changed');
      }

      if (editBonus !== 0) {
        const bonusData = {
          walletAddress: editWalletAddress,
        };
        bonusData.bonus = editBonus;
        await axios.put(process.env.REACT_APP_API_URL + 'employee', bonusData);
        console.log('Bonus changed');
      }

      if (editPenalty !== 0) {
        const penaltyData = {
          walletAddress: editWalletAddress,
        };
        penaltyData.penalty = editPenalty;
        await axios.put(
          process.env.REACT_APP_API_URL + 'employee',
          penaltyData,
        );
        console.log('Penalty changed');
      }
      fetchEmployees();
    } catch (error) {
      console.error('Editing not completed: ', error);
      fetchEmployees();
      alert('Editing not completed');
    }

    const editedEmployee = {
      ...employees[editEmployeeIndex],
      salary: editSalary,
      bonus: editBonus,
      penalty: editPenalty,
      totalPayout: editSalary + editBonus - editPenalty,
    };
    const updatedEmployees = [...employees];
    updatedEmployees[editEmployeeIndex] = editedEmployee;
    setEmployees(updatedEmployees);
    handleModalClose();
  };

  const renderTableRows = () => {
    return employees
      .filter(
        (employee) =>
          employee.full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          employee.wallet_address
            .toLowerCase()
            .includes(searchWalletQuery.toLowerCase()),
      )
      .map((employee, index) => (
        <tr key={index}>
          <td>
            <span className="lablelMobile">Employee</span>
            <span>{employee.full_name}</span>
          </td>
          <td>
            <span className="lablelMobile">Wallet</span>
            <span className="smallText">{employee.wallet_address}</span>
          </td>
          <td>
            <span className="lablelMobile">Salary</span>
            <span>{employee.salary}</span>
          </td>
          <td>
            <span className="lablelMobile">Bonus</span>
            <span>{employee.bonus}</span>
          </td>
          <td>
            <span className="lablelMobile">Penalty</span>
            {employee.penalty}
          </td>
          <td>
            <span className="lablelMobile">Payment</span>
            {employee.salary + employee.bonus - employee.penalty}
          </td>
          <td>
            <button
              className="list-table-button"
              onClick={() => openEditModal(employee.walletAddress)}
            >
              Edit
            </button>
          </td>
        </tr>
      ));
  };

  return (
    <div>
      <div className="list-search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by employee name"
          className="list-search-input"
        />
      </div>

      <div className="list-search-container">
        <input
          type="text"
          value={searchWalletQuery}
          onChange={(e) => setSearchWalletQuery(e.target.value)}
          placeholder="Search by wallets"
          className="list-search-input"
        />
      </div>
      <table className="list-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Wallet</th>
            <th>Salary</th>
            <th>Bonus</th>
            <th>Penalty</th>
            <th>Payment</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>
      <br />
      <div>Total payout: 0 {process.env.REACT_APP_TOKEN_TIKER}</div>
      <br />
      <div>
        Smart contract balance: {}
        {smartContractBalance}
      </div>
      <br />
      <button className="list-pay-button">Payout to everyone</button>

      {showEditModal && (
        <div className="list-modal-overlay">
          <div className="list-modal">
            <h2>Editing</h2>
            <p>Leave 0 if you don't want to change the field</p>
            <div>
              <div>
                <label>Salary</label>
                <input
                  type="text"
                  id="editSalary"
                  name="editSalary"
                  className="list-modal-input"
                  value={editSalary}
                  onChange={handleEditInputChange}
                  onFocus={() => handleFieldFocus('salary')}
                  onBlur={() => handleFieldBlur('salary')}
                />
                <label htmlFor="salary">
                  {fieldFocused.salary || newEmployee.salary !== '' ? '' : ''}
                </label>
              </div>

              <div>
                <label>Bonus</label>
                <input
                  type="text"
                  id="editBonus"
                  name="editBonus"
                  className="list-modal-input"
                  value={editBonus}
                  onChange={handleEditInputChange}
                  onFocus={() => handleFieldFocus('bonus')}
                  onBlur={() => handleFieldBlur('bonus')}
                />
                <label htmlFor="bonus">
                  {fieldFocused.bonus || newEmployee.bonus !== ''
                    ? ''
                    : 'Bonus'}
                </label>
              </div>

              <div>
                <label>Penalty</label>
                <input
                  type="text"
                  id="editPenalty"
                  name="editPenalty"
                  className="list-modal-input"
                  value={editPenalty}
                  onChange={handleEditInputChange}
                  onFocus={() => handleFieldFocus('penalty')}
                  onBlur={() => handleFieldBlur('penalty')}
                />
                <label htmlFor="penalty">
                  {fieldFocused.penalty || newEmployee.penalty !== ''
                    ? ''
                    : 'Penalty'}
                </label>
              </div>

              <div className="button-group">
                <button className="add-employee-button" onClick={saveChanges}>
                  Save changes
                </button>
                <button
                  className="add-employee-button"
                  onClick={deleteTheEmployee}
                  style={{ backgroundColor: 'red' }}
                >
                  Delete employee
                </button>
              </div>
              <button
                className="close-modal-button"
                onClick={handleModalClose}
                style={{ margin: 'auto', marginTop: '10px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
