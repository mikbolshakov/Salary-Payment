import ConnectWalletButton from './connectWallet/ConnectWalletButton';
import AddEmployeeButton from './addEmployee/AddEmployeeButton';
import SearchEmployee from './searchEmployee/SearchEmployee';
import "./Header.css"

const Header = () => {
  return (
    <div className="header">
      <h1>Salary Payment</h1>
      <div className="header-comps">
        <div>
        <SearchEmployee />
        </div>

        <div className="buttons">
          <ConnectWalletButton />
          <AddEmployeeButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
