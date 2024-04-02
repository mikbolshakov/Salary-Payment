import { useState } from 'react';
import axios from 'axios';
import './AddEmployeeButton.css';

const AddEmployeeButton = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
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

    if (!fullName) alert('Enter employee name');
    else if (employees.some((employee) => employee.fullName === fullName))
      alert('This employee is already working');
    else if (!walletAddress.startsWith('0x') || walletAddress.length !== 42)
      alert(
        'The wallet address must start with "0x" and be 42 characters long',
      );
    else if (!salary || isNaN(Number(salary))) alert('Salary must be a number');
    else return true;

    return false;
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await axios.post(process.env.REACT_APP_API_URL + 'employees', {
          full_name: newEmployee.fullName,
          wallet_address: newEmployee.walletAddress,
          salary: newEmployee.salary,
        });
        fetchEmployees();
        handleModalClose();
      } catch (error) {
        console.error('Failed to add employee to database: ', error);
        alert('Limitation in a database');
      }
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + 'employees',
      );
      setEmployees(response.data);
      window.location.reload();
    } catch (error) {
      console.error('Employee display error: ', error);
      alert('Employee display error');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
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
        <div className="header-modal-overlay">
          <div className="header-modal">
            <h2>Add employee</h2>
            <div>
              <div className="header-form-group">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="header-form-input"
                  value={newEmployee.fullName}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus('fullName')}
                  onBlur={() => handleFieldBlur('fullName')}
                />
                <label className="header-form-label" htmlFor="fullName">
                  {fieldFocused.fullName || newEmployee.fullName !== ''
                    ? ''
                    : 'Name'}
                </label>
              </div>

              <div className="header-form-group">
                <input
                  type="text"
                  id="walletAddress"
                  name="walletAddress"
                  className="header-form-input"
                  value={newEmployee.walletAddress}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus('walletAddress')}
                  onBlur={() => handleFieldBlur('walletAddress')}
                />
                <label className="header-form-label" htmlFor="walletAddress">
                  {fieldFocused.walletAddress ||
                  newEmployee.walletAddress !== ''
                    ? ''
                    : 'Wallet address'}
                </label>
              </div>

              <div className="header-form-group">
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  className="header-form-input"
                  value={newEmployee.salary}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus('salary')}
                  onBlur={() => handleFieldBlur('salary')}
                />
                <label className="header-form-label" htmlFor="salary">
                  {fieldFocused.salary || newEmployee.salary !== ''
                    ? ''
                    : 'Salary'}
                </label>
              </div>

              <div className="header-button-group">
                <button
                  className="header-add-employee-button"
                  onClick={handleAddEmployee}
                >
                  Add employee
                </button>
                <button
                  className="header-close-modal-button"
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
