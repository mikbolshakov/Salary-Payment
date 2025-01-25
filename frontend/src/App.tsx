import { useEffect, useState } from 'react';
import { paySalaries } from './services/paySalaries';
import { fetchEmployees } from './utils/fetchEmpoyees';
import { fetchTransactions } from './utils/fetchTransactions';
import { fetchContractBalance } from './utils/fetchContractBalance';
import { fetchAdminUsdBalance } from './utils/fetchAdminUsdBalance';
import Loader from './components/loader/Loader';
import ConnectButton from './components/connect/ConnectButton';
import PaymentComponent from './components/payment/PaymentComponent';
import EmployeeTable from './components/employee/EmployeeTable';
import SearchComponent from './components/search/SearchComponent';
import Header from './components/header/Header';
import AddEmployeeButton from './components/addEmployee/AddEmployeeButton';
import AddEmployeeModal from './modals/addEmployee/AddEmployeeModal';
import EditEmployeeModal from './modals/editEmployee/EditEmployeeModal';
import TransactionsModal from './modals/transactions/TransactionsModal';
import { Employee } from './interfaces/Employee';
import { Transaction } from './interfaces/Transaction';
import './App.css';

const App = () => {
  // PaymentComponent
  const [totalPayout, setTotalPayout] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [usdBalance, setUsdBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // SearchComponent
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchWalletQuery, setSearchWalletQuery] = useState<string>('');
  // EmployeeTable
  const [editWalletAddress, setEditWalletAddress] = useState<string>('');
  const [editSalary, setEditSalary] = useState<string>('');
  const [editBonus, setEditBonus] = useState<string>('');
  const [editPenalty, setEditPenalty] = useState<string>('');
  // showAddModal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  // showEditModal
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  // showTxsModal
  const [showTxsModal, setShowTxsModal] = useState<boolean>(false);

  useEffect(() => {
    getEmployees();
    getContractBalance();
    getAdminUsdBalance();
  }, []);

  useEffect(() => {
    calculateTotalPayout();
  }, [employees]);

  const getEmployees = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const getContractBalance = async () => {
    try {
      const formattedBalance = await fetchContractBalance();
      const balance = formattedBalance ? parseFloat(formattedBalance) : 0;
      setTokenBalance(balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const getAdminUsdBalance = async () => {
    try {
      const formattedBalance = await fetchAdminUsdBalance();
      const balance = formattedBalance ? parseFloat(formattedBalance) : 0;
      setUsdBalance(balance);
    } catch (error) {
      console.error('Failed to fetch USD balance:', error);
    }
  };

  const calculateTotalPayout = () => {
    let total = 0;
    employees.forEach((employee) => {
      const salary = parseInt(employee.salary) || 0;
      const bonus = parseInt(employee.bonus) || 0;
      const penalty = parseInt(employee.penalty) || 0;
      total += salary + bonus - penalty;
    });
    setTotalPayout(total);
    return total;
  };

  const handlePaySalaries = async () => {
    setLoading(true);
    const total = calculateTotalPayout();
    await paySalaries(employees, total);
    setLoading(false);
  };

  const getTransactions = async () => {
    setShowTxsModal(true);
    try {
      const transactions = await fetchTransactions();
      setTransactions(transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const openEditModal = (wallet_address: string) => {
    const employee = employees.find(
      (emp) => emp.wallet_address === wallet_address,
    );
    if (employee) {
      setEditWalletAddress(wallet_address);
      setEditSalary(employee.salary);
      setEditBonus(employee.bonus);
      setEditPenalty(employee.penalty);
      setShowEditModal(true);
    }
  };

  return (
    <div className="container">
      <Header />

      <PaymentComponent
        totalPayout={totalPayout}
        tokenBalance={tokenBalance}
        paySalaries={handlePaySalaries}
        getTransactions={getTransactions}
        usdBalance={usdBalance}
      />

      <div className="top-bar">
        <SearchComponent
          searchQuery={searchQuery}
          searchWalletQuery={searchWalletQuery}
          onSearchChange={setSearchQuery}
          onSearchWalletChange={setSearchWalletQuery}
        />

        <div className="actions">
          <AddEmployeeButton onClick={() => setShowAddModal(true)} />
          <ConnectButton />
        </div>
      </div>

      <EmployeeTable
        employees={employees}
        searchQuery={searchQuery}
        searchWalletQuery={searchWalletQuery}
        onEdit={openEditModal}
      />

      {showAddModal && (
        <AddEmployeeModal
          employees={employees}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && (
        <EditEmployeeModal
          walletAddress={editWalletAddress}
          initialSalary={editSalary}
          initialBonus={editBonus}
          initialPenalty={editPenalty}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showTxsModal && (
        <TransactionsModal
          transactions={transactions}
          onClose={() => setShowTxsModal(false)}
        />
      )}

      {loading && <Loader />}
    </div>
  );
};

export default App;
