import React, { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import contractAbi from "./ABI/contractAbi.json";
import tokenAbi from "./ABI/tokenAbi.json";
import WalletConnect from "./components/WalletConnect";
import axios from "axios";
import "./App.css";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractAbi, signer);

const App = () => {
  const [totalPayout, setTotalPayout] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [txs, setTxs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchWalletQuery, setSearchWalletQuery] = useState("");
  const [editEmployeeIndex, setEditEmployeeIndex] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTxsModal, setShowTxsModal] = useState(false);
  const [editWalletAddress, setEditWalletAddress] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editBonus, setEditBonus] = useState(0);
  const [editPenalty, setEditPenalty] = useState(0);
  const [newEmployee, setNewEmployee] = useState({
    fullName: "",
    walletAddress: "",
    salary: "",
  });
  const [fieldFocused, setFieldFocused] = useState({
    fullName: false,
    walletAddress: false,
    salary: false,
  });

  useEffect(() => {
    fetchEmployees();
    checkBalance();
  }, []);

  useEffect(() => {
    calculateTotalPayout();
  }, [employees]);

  const checkBalance = async () => {
    try {
      const address = process.env.REACT_APP_TOKEN_ADDRESS;
      const contract = new ethers.Contract(address, tokenAbi, provider);
      const balance = await contract.balanceOf(contractAddress);
      setTokenCount(balance.toString() / 10 ** 18);
    } catch (error) {
      console.error("Smart contract balance display error: ", error);
      alert("Smart contract balance display error");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:3500/all");
      setEmployees(response.data);
    } catch (error) {
      console.error("Employee display error: ", error);
      alert("Employee display error");
    }
  };

  const createEmployee = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowEditModal(false);
    setNewEmployee({
      fullName: "",
      walletAddress: "",
      salary: "",
    });
    setFieldFocused({
      fullName: false,
      walletAddress: false,
      salary: false,
    });
    setError("");
  };

  const handleTxsModalClose = () => {
    setShowTxsModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: value,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "editSalary") {
      if (!isNaN(Number(value))) {
        setError("");
        setEditSalary(value);
      } else {
        setError("Salary must be a number");
      }
    } else if (name === "editBonus") {
      if (!isNaN(Number(value))) {
        setError("");
        setEditBonus(value);
      } else {
        setError("Bonus must be a number");
      }
    } else if (name === "editPenalty") {
      if (!isNaN(Number(value))) {
        setError("");
        setEditPenalty(value);
      } else {
        setError("Penalty must be a number");
      }
    }
  };

  const handleFieldFocus = (fieldName) => {
    setFieldFocused({
      ...fieldFocused,
      [fieldName]: true,
    });
  };

  const handleFieldBlur = (fieldName) => {
    if (newEmployee[fieldName] === "") {
      setFieldFocused({
        ...fieldFocused,
        [fieldName]: false,
      });
    }
  };

  const validateForm = () => {
    const { fullName, walletAddress, salary } = newEmployee;
    if (!fullName) setError("Enter the name of the employee");
    else if (employees.some((employee) => employee.fullName === fullName))
      setError("Such an employee is already working");
    else if (!walletAddress.startsWith("0x") || walletAddress.length !== 42)
      setError(
        'The wallet address must start with "0x" and be 42 characters long'
      );
    else if (!salary || isNaN(Number(salary)))
      setError("Salary must be a number");
    else return true;
    return false;
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      let receipt;

      try {
        const tx = await contract.addEmployee(
          newEmployee.walletAddress,
          BigNumber.from(newEmployee.salary).mul(
            BigNumber.from("1000000000000000000")
          )
        );
        receipt = await tx.wait();
      } catch (error) {
        alert("Limitation in a smart contract");
        console.error("Failed to add employee to smart contract: ", error);
      }

      if (receipt.status === 1) {
        try {
          await axios.post("http://localhost:3500/employees", {
            fullName: newEmployee.fullName,
            walletAddress: newEmployee.walletAddress,
            salary: newEmployee.salary,
          });
          fetchEmployees();
          handleModalClose();
        } catch (error) {
          alert("Limitation in a database");
          console.error("Failed to add employee to database: ", error);
        }
      } else {
        console.log("Error when executing a transaction on a smart contract");
      }
    }
  };

  const openEditModal = (walletAddress) => {
    const employee = employees.find(
      (emp) => emp.walletAddress === walletAddress
    );
    setEditSalary(0);
    setEditBonus(0);
    setEditPenalty(0);
    setEditWalletAddress(walletAddress);
    setShowEditModal(true);
  };

  const saveChanges = async () => {
    try {
      const employeeNumber = await contract.checkEmployeeNumber(
        editWalletAddress
      );
      if (editSalary !== 0) {
        const salaryData = {
          walletAddress: editWalletAddress,
        };
        const txSalary = await contract.setEmployeeSalary(
          employeeNumber,
          BigNumber.from(editSalary).mul(BigNumber.from("1000000000000000000"))
        );
        const receiptSalary = await txSalary.wait();
        salaryData.salary = editSalary;
        await axios.put("http://localhost:3500/employees/patch", salaryData);
        console.log("Salary changed");

        if (receiptSalary.status !== 1)
          console.log("Failed to update employee salary");
      }

      if (editBonus !== 0) {
        const bonusData = {
          walletAddress: editWalletAddress,
        };

        const txBonus = await contract.setEmployeeBonus(
          employeeNumber,
          BigNumber.from(editBonus).mul(BigNumber.from("1000000000000000000"))
        );
        const receiptBonus = await txBonus.wait();
        bonusData.bonus = editBonus;
        await axios.put("http://localhost:3500/employees/patch", bonusData);
        console.log("Bonus changed");
        if (receiptBonus.status !== 1)
          console.log("Failed to update employee bonus");
      }

      if (editPenalty !== 0) {
        const penaltyData = {
          walletAddress: editWalletAddress,
        };

        const txPenalty = await contract.setEmployeePenalty(
          employeeNumber,
          BigNumber.from(editPenalty).mul(BigNumber.from("1000000000000000000"))
        );
        const receiptPenalty = await txPenalty.wait();
        penaltyData.penalty = editPenalty;
        await axios.put("http://localhost:3500/employees/patch", penaltyData);
        console.log("Penalty changed");
        if (receiptPenalty.status !== 1)
          console.log("Failed to update employee penalty");
      }
      fetchEmployees();
    } catch (error) {
      console.error("Editing not completed: ", error);
      fetchEmployees();
      alert("Editing not completed");
    }

    const editedEmployee = {
      ...employees[editEmployeeIndex],
      salary: editSalary,
      bonus: editBonus,
      penalty: editPenalty,
      totalPayout: editSalary + editBonus - editPenalty,
    };
    const updatedEmployees = [...employees];
    updatedEmployees[editEmployeeIndex] = editedEmployee;
    setEmployees(updatedEmployees);
    handleModalClose();
  };

  const deleteTheEmployee = async () => {
    const data = {
      walletAddress: editWalletAddress,
    };

    let receipt;

    try {
      const employeeNumber = await contract.checkEmployeeNumber(
        editWalletAddress.toString()
      );
      const tx = await contract.deleteEmployee(employeeNumber);
      receipt = await tx.wait();
    } catch (error) {
      alert("Limitation in a smart contract");
      console.error("Failed to remove employee from smart contract: ", error);
    }

    if (receipt.status === 1) {
      try {
        await axios.delete(
          `http://localhost:3500/employees/delete?walletAddress=${editWalletAddress}`,
          data
        );
        fetchEmployees();
      } catch (error) {
        alert("Limitation in a database");
        console.error("Failed to remove employee from database: ", error);
      }
    } else {
      console.log("Error when executing a transaction on a smart contract");
    }

    setShowEditModal(false);
    handleModalClose();
  };

  const checkAllTxs = async () => {
    setShowTxsModal(true);
    renderTableTxsRows();
  };

  const paySalaries = async () => {
    let receipt;
    try {
      const tx = await contract.paySalary();
      receipt = await tx.wait();
    } catch (error) {
      alert("Limitation in a smart contract");
      console.error("Failed to pay salaries in smart contract: ", error);
    }

    if (receipt.status === 1) {
      try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
        const day = ("0" + currentDate.getDate()).slice(-2);

        const formattedDate = `${year}-${month}-${day}`;
        const amount = calculateTotalPayout();
        const transactionHash = receipt.transactionHash;
        const explorerLink = `https://mumbai.polygonscan.com/tx/${transactionHash}`;

        const transactionData = {
          date: formattedDate,
          amount: amount,
          hash: explorerLink,
        };

        await axios.post("http://localhost:3500/transactions", transactionData);

        for (let employee of employees) {
          const data = {
            walletAddress: employee.walletAddress,
            bonus: 0,
            penalty: 0,
          };
          await axios.put("http://localhost:3500/employees/patch", data);
        }
        alert("Salaries paid successfully");
        fetchEmployees();
      } catch (error) {
        alert("Limitation in a database");
        console.error(
          "Failed to reset Bonuses and Penalties of employees or add a transaction to the database: ",
          error
        );
      }
    } else {
      console.log("Error when executing a transaction on a smart contract");
    }
  };

  const renderTableRows = () => {
    return employees
      .filter(
        (employee) =>
          employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          employee.walletAddress
            .toLowerCase()
            .includes(searchWalletQuery.toLowerCase())
      )
      .map((employee, index) => (
        <tr key={index}>
          <td>
            <span className="lablelMobile">Employee</span>
            <span>{employee.fullName}</span>
          </td>
          <td>
            <span className="lablelMobile">Wallet</span>
            <span className="smallText">{employee.walletAddress}</span>
          </td>
          <td>
            <span className="lablelMobile">Salary</span>
            <span>{employee.salary}</span>
          </td>
          <td>
            <span className="lablelMobile">Bonus</span>
            <span>{employee.bonus}</span>
          </td>
          <td>
            <span className="lablelMobile">Penalty</span>
            {employee.penalty}
          </td>
          <td>
            <span className="lablelMobile">Payment</span>
            {employee.salary + employee.bonus - employee.penalty}
          </td>
          <td>
            <button
              className="table-button"
              onClick={() => openEditModal(employee.walletAddress)}
            >
              Edit
            </button>
          </td>
        </tr>
      ));
  };

  const renderTableTxsRows = async () => {
    try {
      const response = await axios.get("http://localhost:3500/transactions");
      setTxs(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const calculateTotalPayout = () => {
    let total = 0;
    employees.forEach((employee) => {
      total += employee.salary + employee.bonus - employee.penalty;
    });
    setTotalPayout(total);
    return total;
  };

  return (
    <div className="container">
      <WalletConnect />

      <h1 className="title">Wage Payment Project</h1>

      <button
        className="connect-button"
        onClick={createEmployee}
        style={{ textAlign: "center" }}
      >
        Add employee
      </button>

      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by employee name"
          className="search-input"
        />
      </div>

      <div className="search-container">
        <input
          type="text"
          value={searchWalletQuery}
          onChange={(e) => setSearchWalletQuery(e.target.value)}
          placeholder="Search by employee wallet"
          className="search-input"
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Wallet</th>
            <th>Salary</th>
            <th>Bonus</th>
            <th>Penalty</th>
            <th>Payment</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>

      <div className="total-payout">Total payout: {totalPayout}</div>
      <div className="total-payout">Contract balance: {tokenCount}</div>

      <div className="total-bottom">
        <button
          className="connect-button"
          onClick={paySalaries}
          style={{ marginRight: "60px", backgroundColor: "green" }}
        >
          Pay out to everyone
        </button>

        <button
          className="connect-button"
          onClick={checkAllTxs}
          style={{ marginRight: "60px" }}
        >
          All payments
        </button>
      </div>
      {showTxsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ width: "400px", textAlign: "center" }}>
              All employee payments
            </h2>
            <div>
              <table className="table">
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
                          className="table-button"
                          style={{ margin: "0" }}
                          onClick={() =>
                            window.open(transaction.hash, "_blank")
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
                className="close-modal-button"
                onClick={handleTxsModalClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add employee</h2>
            <div className="employee-form">
              <div className="form-group">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`form-input ${
                    fieldFocused.fullName || newEmployee.fullName !== ""
                      ? "form-input-filled"
                      : ""
                  }`}
                  value={newEmployee.fullName}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus("fullName")}
                  onBlur={() => handleFieldBlur("fullName")}
                />
                <label
                  className={`form-label ${
                    fieldFocused.fullName || newEmployee.fullName !== ""
                      ? "form-label-hidden"
                      : ""
                  }`}
                  htmlFor="fullName"
                >
                  {fieldFocused.fullName || newEmployee.fullName !== ""
                    ? ""
                    : "Name"}
                </label>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="walletAddress"
                  name="walletAddress"
                  className={`form-input ${
                    fieldFocused.walletAddress ||
                    newEmployee.walletAddress !== ""
                      ? "form-input-filled"
                      : ""
                  }`}
                  value={newEmployee.walletAddress}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus("walletAddress")}
                  onBlur={() => handleFieldBlur("walletAddress")}
                />
                <label
                  className={`form-label ${
                    fieldFocused.walletAddress ||
                    newEmployee.walletAddress !== ""
                      ? "form-label-hidden"
                      : ""
                  }`}
                  htmlFor="walletAddress"
                >
                  {fieldFocused.walletAddress ||
                  newEmployee.walletAddress !== ""
                    ? ""
                    : "Wallet address"}
                </label>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  className={`form-input ${
                    fieldFocused.salary || newEmployee.salary !== ""
                      ? "form-input-filled"
                      : ""
                  }`}
                  value={newEmployee.salary}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus("salary")}
                  onBlur={() => handleFieldBlur("salary")}
                />
                <label
                  className={`form-label ${
                    fieldFocused.salary || newEmployee.salary !== ""
                      ? "form-label-hidden"
                      : ""
                  }`}
                  htmlFor="salary"
                >
                  {fieldFocused.salary || newEmployee.salary !== ""
                    ? ""
                    : "Salary"}
                </label>
              </div>

              {error && <p className="error">{error}</p>}
              <div className="button-group">
                <button className="add-employee-button" onClick={addEmployee}>
                  Add employee
                </button>
                <button
                  className="close-modal-button"
                  onClick={handleModalClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ textAlign: "center" }}>Editing</h2>
            <p>Leave 0 if you don't want to change the field</p>
            <div className="employee-form">
              <div className="form-group">
                <label className="label">Salary</label>
                <input
                  type="text"
                  id="editSalary"
                  name="editSalary"
                  className={`form-input ${
                    fieldFocused.salary || newEmployee.salary !== ""
                      ? "form-input-filled"
                      : ""
                  }`}
                  value={editSalary}
                  onChange={handleEditInputChange}
                  onFocus={() => handleFieldFocus("salary")}
                  onBlur={() => handleFieldBlur("salary")}
                />
                <label
                  className={`form-label ${
                    fieldFocused.salary || newEmployee.salary !== ""
                      ? "form-label-hidden"
                      : ""
                  }`}
                  htmlFor="salary"
                >
                  {fieldFocused.salary || newEmployee.salary !== "" ? "" : ""}
                </label>
              </div>

              <div className="form-group">
                <label>Bonus</label>
                <input
                  type="text"
                  id="editBonus"
                  name="editBonus"
                  className={`form-input ${
                    fieldFocused.bonus || newEmployee.bonus !== ""
                      ? "form-input-filled"
                      : ""
                  }`}
                  value={editBonus}
                  onChange={handleEditInputChange}
                  onFocus={() => handleFieldFocus("bonus")}
                  onBlur={() => handleFieldBlur("bonus")}
                />
                <label
                  className={`form-label ${
                    fieldFocused.bonus || newEmployee.bonus !== ""
                      ? "form-label-hidden"
                      : ""
                  }`}
                  htmlFor="bonus"
                >
                  {fieldFocused.bonus || newEmployee.bonus !== ""
                    ? ""
                    : "Bonus"}
                </label>
              </div>

              <div className="form-group">
                <label>Penalty</label>
                <input
                  type="text"
                  id="editPenalty"
                  name="editPenalty"
                  className={`form-input ${
                    fieldFocused.penalty || newEmployee.penalty !== ""
                      ? "form-input-filled"
                      : ""
                  }`}
                  value={editPenalty}
                  onChange={handleEditInputChange}
                  onFocus={() => handleFieldFocus("penalty")}
                  onBlur={() => handleFieldBlur("penalty")}
                />
                <label
                  className={`form-label ${
                    fieldFocused.penalty || newEmployee.penalty !== ""
                      ? "form-label-hidden"
                      : ""
                  }`}
                  htmlFor="penalty"
                >
                  {fieldFocused.penalty || newEmployee.penalty !== ""
                    ? ""
                    : "Penalty"}
                </label>
              </div>

              {error && <p className="error">{error}</p>}
              <div className="button-group">
                <button className="add-employee-button" onClick={saveChanges}>
                  Save changes
                </button>
                <button
                  className="add-employee-button"
                  onClick={deleteTheEmployee}
                  style={{ backgroundColor: "red" }}
                >
                  Delete employee
                </button>
              </div>
              <button
                className="close-modal-button"
                onClick={handleModalClose}
                style={{ margin: "auto", marginTop: "10px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
