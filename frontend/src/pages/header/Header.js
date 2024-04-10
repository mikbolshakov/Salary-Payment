import ConnectWalletButton from './connectWallet/ConnectWalletButton';
import AddEmployeeButton from './addEmployee/AddEmployeeButton';
import AllPayments from './allPayments/AllPayments';
import './Header.css';

const Header = () => {
  return (
    <div className="header">
      <h1>Salary Payment</h1>
      <div className="total-payout">
        <p>Smart contract admin:</p>
        <p>{process.env.REACT_APP_ADMIN_ADDRESS}</p>
      </div>
      <div className="header-container">
        <div>
          <AddEmployeeButton />
          <AllPayments />
        </div>

        <div>
          <ConnectWalletButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
