import { FC, useState, useEffect } from 'react';
import Loader from '../../components/loader/Loader';
import { handleDeleteEmployee } from '../../services/deleteEmployee';
import { handleUpdateSalary } from '../../services/updateSalary';
import { handleUpdateBonus } from '../../services/updateBonus';
import { handleUpdatePenalty } from '../../services/updatePenalty';
import { EditEmployeeModalProps } from '../../interfaces/props/EditEmployeeModalProps';
import './EditEmployeeModal.css';

const EditEmployeeModal: FC<EditEmployeeModalProps> = ({
  walletAddress,
  initialSalary,
  initialBonus,
  initialPenalty,
  onClose,
}) => {
  const [editSalary, setEditSalary] = useState<string>(
    parseInt(initialSalary).toString(),
  );
  const [editBonus, setEditBonus] = useState<string>(
    parseInt(initialBonus).toString(),
  );
  const [editPenalty, setEditPenalty] = useState<string>(
    parseInt(initialPenalty).toString(),
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    setEditSalary(parseInt(initialSalary).toString());
    setEditBonus(parseInt(initialBonus).toString());
    setEditPenalty(parseInt(initialPenalty).toString());
  }, [initialSalary, initialBonus, initialPenalty]);

  return (
    <div className="edit-employee-modal__overlay">
      <div className="edit-employee-modal__container">
        <h2 className="edit-employee-modal__title">Edit Employee salary</h2>
        <form>
          <div className="edit-employee-modal__input-group">
            <label>Salary:</label>
            <input
              type="number"
              value={editSalary}
              onChange={(e) => setEditSalary(e.target.value)}
            />
            <button
              type="button"
              onClick={() =>
                handleUpdateSalary(
                  walletAddress,
                  editSalary,
                  onClose,
                  setLoading,
                )
              }
            >
              Update Salary
            </button>
          </div>
          <div className="edit-employee-modal__input-group">
            <label>Bonus:</label>
            <input
              type="number"
              value={editBonus}
              onChange={(e) => setEditBonus(e.target.value)}
            />
            <button
              type="button"
              onClick={() =>
                handleUpdateBonus(walletAddress, editBonus, onClose, setLoading)
              }
            >
              Update Bonus
            </button>
          </div>
          <div className="edit-employee-modal__input-group">
            <label>Penalty:</label>
            <input
              type="number"
              value={editPenalty}
              onChange={(e) => setEditPenalty(e.target.value)}
            />
            <button
              type="button"
              onClick={() =>
                handleUpdatePenalty(
                  walletAddress,
                  editPenalty,
                  onClose,
                  setLoading,
                )
              }
            >
              Update Penalty
            </button>
          </div>
        </form>
        <div className="edit-employee-modal__actions">
          <button
            className="edit-employee-modal__delete-button"
            onClick={() => handleDeleteEmployee(walletAddress, setLoading)}
          >
            Delete Employee
          </button>
          <button
            className="edit-employee-modal__close-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
};

export default EditEmployeeModal;
