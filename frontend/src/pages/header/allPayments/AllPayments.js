import { useState } from 'react';
import axios from 'axios';
import './AllPayments.css';

const AllPayments = () => {
  const [showTxsModal, setShowTxsModal] = useState(false);
  const [txs, setTxs] = useState([]);

  const handleTxsModalOpen = async () => {
    setShowTxsModal(true);
    renderTableTxsRows();
  };

  const handleTxsModalClose = () => {
    setShowTxsModal(false);
  };

  const renderTableTxsRows = async () => {
    try {
      const response = await axios.get('http://localhost:3500/transactions');
      setTxs(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <button
        className="payments-connect-button"
        onClick={handleTxsModalOpen}
      >
        All payments
      </button>
      {showTxsModal && (
        <div className="payments-modal-overlay">
          <div className="payments-modal">
            <h2 style={{ width: '400px', textAlign: 'center' }}>
              All employee payments
            </h2>
            <div>
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{transaction.date.slice(0, 10)}</td>
                      <td>{transaction.amount}</td>
                      <td>
                        <button
                          className="payments-table-button"
                          style={{ margin: '0' }}
                          onClick={() =>
                            window.open(transaction.hash, '_blank')
                          }
                        >
                          Follow
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="payments-close-modal-button"
                onClick={handleTxsModalClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllPayments;
