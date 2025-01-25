import { ADMIN, CONTRACT_EXPLORER_LINK } from '../../constants/constants';
import { PaymentProps } from '../../interfaces/props/PaymentProps';
import './PaymentComponent.css';

const Payment: React.FC<PaymentProps> = ({
  totalPayout,
  tokenBalance,
  paySalaries,
  getTransactions,
  usdBalance,
}) => {
  return (
    <div className="payment">
      <div className="payment__left">
        <div className="payment__admin-section">
          <div className="payment__admin-title">Main admin:</div>
          <div className="payment__admin">{ADMIN}</div>
        </div>
        {/* <div className="payment__admins">
          <div className="payment__admin-title">Admins:</div>
          {admins.map((admin, index) => (
            <span key={index}>{admin}</span>
          ))}
        </div> */}
      </div>
      <div className="payment__right">
        <div className="payment__info">
          Total payout: <strong>{totalPayout}</strong> Tokens
        </div>
        <div className="payment__info">
          <a href={CONTRACT_EXPLORER_LINK} target="_blank" rel="noreferrer">
            Contract{' '}
          </a>{' '}
          balance : <strong>{tokenBalance}</strong> Tokens
        </div>
        <div className="payment__info">
          Admin balance : <strong>{usdBalance}</strong> USD
        </div>
        <div className="payment__buttons">
          <button className="payment__button--green" onClick={paySalaries}>
            Paymnet for all
          </button>
          <button className="payment__button--brown" onClick={getTransactions}>
            All payments
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
