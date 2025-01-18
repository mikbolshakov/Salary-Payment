import { AddEmployeeButtonProps } from '../../interfaces/props/AddEmployeeButtonProps';
import './AddEmployeeButton.css';

const AddEmployeeButton: React.FC<AddEmployeeButtonProps> = ({ onClick }) => {
  return (
    <button className="add-employee__button" onClick={onClick}>
      Add employee
    </button>
  );
};

export default AddEmployeeButton;
