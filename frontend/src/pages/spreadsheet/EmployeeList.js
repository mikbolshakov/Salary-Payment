import './EmployeeList.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchWalletQuery, setSearchWalletQuery] = useState('');
  const [editEmployeeIndex, setEditEmployeeIndex] = useState(null);
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
    setError('');
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
        setError('');
        setEditSalary(value);
      } else {
        setError('Salary must be a number');
      }
    } else if (name === 'editBonus') {
      if (!isNaN(Number(value))) {
        setError('');
        setEditBonus(value);
      } else {
        setError('Bonus must be a number');
      }
    } else if (name === 'editPenalty') {
      if (!isNaN(Number(value))) {
        setError('');
        setEditPenalty(value);
      } else {
        setError('Penalty must be a number');
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

  const renderTableRows = () => {
    return employees
      .filter(
        (employee) =>
          employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
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
              className="table-button"
              onClick={() => openEditModal(employee.walletAddress)}
            >
              Edit
            </button>
          </td>
        </tr>
      ));
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

  return (
    <div className="container">
      <table className="table">
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

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ textAlign: 'center' }}>Editing</h2>
            <p>Leave 0 if you don't want to change the field</p>
            <div className="employee-form">
              <div className="form-group">
                <label className="label">Salary</label>
                <input
                  type="text"
                  id="editSalary"
                  name="editSalary"
                  className={`form-input ${
                    fieldFocused.salary || newEmployee.salary !== ''
                      ? 'form-input-filled'
                      : ''
                  }`}
                  value={editSalary}
                  onChange={handleEditInputChange}
                  onFocus={() => handleFieldFocus('salary')}
                  onBlur={() => handleFieldBlur('salary')}
                />
                <label
                  className={`form-label ${
                    fieldFocused.salary || newEmployee.salary !== ''
                      ? 'form-label-hidden'
                      : ''
                  }`}
                  htmlFor="salary"
                >
                  {fieldFocused.salary || newEmployee.salary !== '' ? '' : ''}
                </label>
              </div>

              <div className="form-group">
                <label>Bonus</label>
                <input
                  type="text"
                  id="editBonus"
                  name="editBonus"
                  className={`form-input ${
                    fieldFocused.bonus || newEmployee.bonus !== ''
                      ? 'form-input-filled'
                      : ''
                  }`}
                  value={editBonus}
                  onChange={handleEditInputChange}
                  onFocus={() => handleFieldFocus('bonus')}
                  onBlur={() => handleFieldBlur('bonus')}
                />
                <label
                  className={`form-label ${
                    fieldFocused.bonus || newEmployee.bonus !== ''
                      ? 'form-label-hidden'
                      : ''
                  }`}
                  htmlFor="bonus"
                >
                  {fieldFocused.bonus || newEmployee.bonus !== ''
                    ? ''
                    : 'Bonus'}
                </label>
              </div>

              <div className="form-group">
                <label>Penalty</label>
                <input
                  type="text"
                  id="editPenalty"
                  name="editPenalty"
                  className={`form-input ${
                    fieldFocused.penalty || newEmployee.penalty !== ''
                      ? 'form-input-filled'
                      : ''
                  }`}
                  value={editPenalty}
                  onChange={handleEditInputChange}
                  onFocus={() => handleFieldFocus('penalty')}
                  onBlur={() => handleFieldBlur('penalty')}
                />
                <label
                  className={`form-label ${
                    fieldFocused.penalty || newEmployee.penalty !== ''
                      ? 'form-label-hidden'
                      : ''
                  }`}
                  htmlFor="penalty"
                >
                  {fieldFocused.penalty || newEmployee.penalty !== ''
                    ? ''
                    : 'Penalty'}
                </label>
              </div>

              {error && <p className="error">{error}</p>}
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
