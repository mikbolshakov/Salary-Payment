import { useEffect, FC } from 'react';
import { formatDate } from '../../utils/formatDate';
import { TransactionsModalProps } from '../../interfaces/props/TransactionsModalProps';
import './TransactionsModal.css';

const TransactionsModal: FC<TransactionsModalProps> = ({
  transactions,
  onClose,
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="transactions-modal__overlay">
      <div className="transactions-modal__container">
        <h2 className="transactions-modal__title">All payments</h2>
        <div className="transactions-modal__content">
          <table className="transactions-modal__table">
            <thead className="transactions-modal__table-head">
              <tr className="transactions-modal__table-row">
              <th className="transactions-modal__table-header">Date</th>
                <th className="transactions-modal__table-header">Amount</th>
                <th className="transactions-modal__table-header">Link</th>
              </tr>
            </thead>
            <tbody className="transactions-modal__table-body">
              {transactions.map((transaction, index) => (
                <tr key={index} className="transactions-modal__table-row">
                  <td className="transactions-modal__table-cell">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="transactions-modal__table-cell">
                    {Number(transaction.amount).toFixed(0)}
                  </td>
                  <td className="transactions-modal__table-cell">
                    <button
                      className="transactions-modal__link-button"
                      onClick={() => window.open(transaction.hash, '_blank')}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="transactions-modal__footer">
          <button
            className="transactions-modal__close-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsModal;
