import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddEmployeeButton.css';

const AddEmployeeButton = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
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

  const createEmployee = () => {
    setShowModal(true);
  };

  const validateForm = () => {
    const { fullName, walletAddress, salary } = newEmployee;

    if (!fullName) setError('Enter employee name');
    else if (employees.some((employee) => employee.fullName === fullName))
      setError('This employee is already working');
    else if (!walletAddress.startsWith('0x') || walletAddress.length !== 42)
      setError(
        'The wallet address must start with "0x" and be 42 characters long',
      );
    else if (!salary || isNaN(Number(salary)))
      setError('Salary must be a number');
    else return true;

    return false;
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await axios.post(process.env.REACT_APP_API_URL + 'employee', {
          full_name: newEmployee.fullName,
          wallet_address: newEmployee.walletAddress,
          salary: newEmployee.salary,
        });
        fetchEmployees();
        handleModalClose();
      } catch (error) {
        alert('Limitation in a database');
        console.error('Failed to add employee to database: ', error);
      }
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + 'employee',
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

  return (
    <>
      <button onClick={createEmployee} className="header-add-button">
        Add Employee
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add employee</h2>
            <div className="employee-form">
              <div className="form-group">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`form-input ${
                    fieldFocused.fullName || newEmployee.fullName !== ''
                      ? 'form-input-filled'
                      : ''
                  }`}
                  value={newEmployee.fullName}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus('fullName')}
                  onBlur={() => handleFieldBlur('fullName')}
                />
                <label
                  className={`form-label ${
                    fieldFocused.fullName || newEmployee.fullName !== ''
                      ? 'form-label-hidden'
                      : ''
                  }`}
                  htmlFor="fullName"
                >
                  {fieldFocused.fullName || newEmployee.fullName !== ''
                    ? ''
                    : 'Name'}
                </label>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="walletAddress"
                  name="walletAddress"
                  className={`form-input ${
                    fieldFocused.walletAddress ||
                    newEmployee.walletAddress !== ''
                      ? 'form-input-filled'
                      : ''
                  }`}
                  value={newEmployee.walletAddress}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus('walletAddress')}
                  onBlur={() => handleFieldBlur('walletAddress')}
                />
                <label
                  className={`form-label ${
                    fieldFocused.walletAddress ||
                    newEmployee.walletAddress !== ''
                      ? 'form-label-hidden'
                      : ''
                  }`}
                  htmlFor="walletAddress"
                >
                  {fieldFocused.walletAddress ||
                  newEmployee.walletAddress !== ''
                    ? ''
                    : 'Wallet address'}
                </label>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  className={`form-input ${
                    fieldFocused.salary || newEmployee.salary !== ''
                      ? 'form-input-filled'
                      : ''
                  }`}
                  value={newEmployee.salary}
                  onChange={handleInputChange}
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
                  {fieldFocused.salary || newEmployee.salary !== ''
                    ? ''
                    : 'Salary'}
                </label>
              </div>

              {error && <p className="error">{error}</p>}
              <div className="button-group">
                <button
                  className="add-employee-button"
                  onClick={handleAddEmployee}
                >
                  Add employee
                </button>
                <button
                  className="close-modal-button"
                  onClick={handleModalClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddEmployeeButton;
