import ConnectWalletButton from './connectWallet/ConnectWalletButton';
import AddEmployeeButton from './addEmployee/AddEmployeeButton';
import './Header.css';

const Header = () => {
  return (
    <div className="header">
      <h1>Salary Payment</h1>
      <ConnectWalletButton />
      <AddEmployeeButton />
    </div>
  );
};

export default Header;
