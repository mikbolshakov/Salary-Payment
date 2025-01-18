import { ChangeEvent, FC, useEffect, useState } from 'react';
import Loader from '../../components/loader/Loader';
import { handleAddEmployee } from '../../services/addEmployee';
import { Employee } from '../../interfaces/Employee';
import { AddEmployeeModalProps } from '../../interfaces/props/AddEmployeeModalProps';
import './AddEmployeeModal.css';

const AddEmployeeModal: FC<AddEmployeeModalProps> = ({
  employees,
  onClose,
}) => {
  const [newEmployee, setNewEmployee] = useState<Employee>({
    full_name: '',
    wallet_address: '',
    salary: '',
    bonus: '',
    penalty: '',
  });
  const [fieldFocused, setFieldFocused] = useState({
    full_name: false,
    wallet_address: false,
    salary: false,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: value,
    });
  };

  const handleFieldFocus = (fieldName: string) => {
    setFieldFocused({
      ...fieldFocused,
      [fieldName]: true,
    });
  };

  const handleFieldBlur = (fieldName: keyof Employee) => {
    if (newEmployee[fieldName] === '') {
      setFieldFocused({
        ...fieldFocused,
        [fieldName]: false,
      });
    }
  };

  return (
    <div className="add-employee-modal__overlay">
      <div className="add-employee-modal__container">
      <h2 className="add-employee-modal__title">Add Employee</h2>
        {error && <div className="add-employee-modal__error">{error}</div>}
        <div className="add-employee-modal__field">
          <input
            type="text"
            name="full_name"
            value={newEmployee.full_name}
            onChange={handleInputChange}
            onFocus={() => handleFieldFocus('full_name')}
            onBlur={() => handleFieldBlur('full_name')}
            placeholder="Full name"
            className={`add-employee-modal__input ${fieldFocused.full_name ? 'add-employee-modal__input--focused' : ''}`}
          />
        </div>
        <div className="add-employee-modal__field">
          <input
            type="text"
            name="wallet_address"
            value={newEmployee.wallet_address}
            onChange={handleInputChange}
            onFocus={() => handleFieldFocus('wallet_address')}
            onBlur={() => handleFieldBlur('wallet_address')}
            placeholder="Wallet address"
            className={`add-employee-modal__input ${fieldFocused.wallet_address ? 'add-employee-modal__input--focused' : ''}`}
          />
        </div>
        <div className="add-employee-modal__field">
          <input
            type="text"
            name="salary"
            value={newEmployee.salary}
            onChange={handleInputChange}
            onFocus={() => handleFieldFocus('salary')}
            onBlur={() => handleFieldBlur('salary')}
            placeholder="Salary"
            className={`add-employee-modal__input ${fieldFocused.salary ? 'add-employee-modal__input--focused' : ''}`}
          />
        </div>
        <div className="add-employee-modal__actions">
          <button
            className="add-employee-modal__link-button"
            onClick={() =>
              handleAddEmployee(
                newEmployee,
                employees,
                setError,
                setLoading,
                onClose,
              )
            }
          >
            Add
          </button>
          <button
            className="add-employee-modal__close-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
};

export default AddEmployeeModal;
