import React, { useState } from "react";
import { ethers, BigNumber } from "ethers";
import contractAbi from "./ABI/contractAbi.json";
import tokenAbi from "./ABI/tokenAbi.json";
import ConnectButton from "./walletConnection/ConnectButton";
import { useWeb3React } from "@web3-react/core";
import { getWalletType } from "./walletConnection/Helpers/StorageWallet";
import { injected } from "./walletConnection/Connectors";
import axios from "axios";
import "./App.css";

const contractAddress = "0x105B63C411598Df46F86D87af283054AA1eBBb9F";
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

  React.useEffect(() => {
    connectWallet();
    activate();
    fetchEmployees();
    checkBalance();
  }, []);

  React.useEffect(() => {
    calculateTotalPayout();
  }, [employees]);

  const { activate } = useWeb3React();
  const connectWallet = async () => {
    if (window.ethereum) {
      const walletType = getWalletType();

      if (walletType) {
        try {
          await activate(injected);
        } catch (e) {
          console.log(e.message);
        }
      }
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:3500/all");
      setEmployees(response.data);
    } catch (error) {
      console.error("Ошибка отображения сотрудников: ", error);
      alert("Ошибка отображения сотрудников");
    }
  };

  const checkBalance = async () => {
    try {
      const tokenAddress = "0xB3861ba5414a3177F03C6cA12168B2016a556dfA";
      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenAbi,
        provider
      );

      const contractTokenBalance = (
        await tokenContract.balanceOf(contractAddress)
      ).toString();
      const frontendBalance = contractTokenBalance / 10 ** 18;
      setTokenCount(frontendBalance);
    } catch (error) {
      console.error("Ошибка отображения баланса смарт контракта: ", error);
      alert("Ошибка отображения баланса смарт контракта");
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
        setError("Оклад должен быть числом");
      }
    } else if (name === "editBonus") {
      if (!isNaN(Number(value))) {
        setError("");
        setEditBonus(value);
      } else {
        setError("Бонус должен быть числом");
      }
    } else if (name === "editPenalty") {
      if (!isNaN(Number(value))) {
        setError("");
        setEditPenalty(value);
      } else {
        setError("Штраф должен быть числом");
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
    if (newEmployee.fullName === "") {
      setError("Введите ФИО сотрудника");
      return false;
    }
    if (
      employees.some((employee) => employee.fullName === newEmployee.fullName)
    ) {
      setError("Такой сотрудник уже работает");
      return false;
    }
    if (newEmployee.walletAddress === "") {
      setError("Введите адрес кошелька сотрудника");
      return false;
    }
    if (
      !newEmployee.walletAddress.startsWith("0x") ||
      newEmployee.walletAddress.length !== 42
    ) {
      setError(
        'Адрес кошелька должен начинаться с "0x" и иметь длину 42 символа'
      );
      return false;
    }
    if (newEmployee.salary === "") {
      setError("Введите оклад сотрудника");
      return false;
    }
    if (isNaN(Number(newEmployee.salary))) {
      setError("Оклад должен быть числом");
      return false;
    }
    return true;
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
        alert("Ограничение в смарт контракте");
        console.error(
          "Не удалось добавить сотрудника в смарт контракт: ",
          error
        );
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
          alert("Ограничение в базе данных");
          console.error(
            "Не удалось добавить сотрудника в базу данных: ",
            error
          );
        }
      } else {
        console.log("Ошибка при выполнении транзакции на смарт-контракте");
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
      console.log(`Номер сотрудника: ${employeeNumber}`);
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
        console.log("Оклад поменяли");

        if (receiptSalary.status !== 1)
          console.log("Не удалось обновить оклад сотрудника");
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
        console.log("Премию поменяли");
        if (receiptBonus.status !== 1)
          console.log("Не удалось обновить премию сотрудника");
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
        console.log("Штрафы поменяли");
        if (receiptPenalty.status !== 1)
          console.log("Не удалось обновить штрафы сотрудника");
      }
      fetchEmployees();
    } catch (error) {
      console.error("Редактирование не завершено: ", error);
      fetchEmployees();
      alert("Редактирование не завершено");
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
      console.log(`Номер сотрудника: ${employeeNumber}`);
      const tx = await contract.deleteEmployee(employeeNumber);
      receipt = await tx.wait();
    } catch (error) {
      alert("Ограничение в смарт контракте");
      console.error(
        "Не удалось удалить сотрудника из смарт контракта: ",
        error
      );
    }

    if (receipt.status === 1) {
      try {
        await axios.delete(
          `http://localhost:3500/employees/delete?walletAddress=${editWalletAddress}`,
          data
        );
        fetchEmployees();
      } catch (error) {
        alert("Ограничение в базе данных");
        console.error("Не удалось удалить сотрудника из базы данных: ", error);
      }
    } else {
      console.log("Ошибка при выполнении транзакции на смарт-контракте");
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
      alert("Ограничение в смарт контракте");
      console.error("Не удалось выплатить зарплаты в смарт контракте: ", error);
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
        alert("Зарплаты успешно выплачены");
        fetchEmployees();
      } catch (error) {
        alert("Ограничение в базе данных");
        console.error(
          "Не удалось обнулить Премии и Штрафы сотрудников или добавить транзакцию в базу данных: ",
          error
        );
      }
    } else {
      console.log("Ошибка при выполнении транзакции на смарт-контракте");
    }
  };

  const renderTableRows = () => {
    return employees.map((employee, index) => (
      <tr key={index}>
        <td>{employee.fullName}</td>
        <td>{employee.walletAddress}</td>
        <td>{employee.salary}</td>
        <td>{employee.bonus}</td>
        <td>{employee.penalty}</td>
        <td>{employee.salary + employee.bonus - employee.penalty}</td>
        <td>
          <button
            className="table-button"
            onClick={() => openEditModal(employee.walletAddress)}
          >
            Изменить
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
      <ConnectButton />

      <h1 className="title">Зарплатный проект ИФ EMIVN</h1>

      <button
        className="connect-button"
        onClick={createEmployee}
        style={{ textAlign: "center" }}
      >
        Создать сотрудника
      </button>

      <table className="table">
        <thead>
          <tr>
            <th>Сотрудник</th>
            <th>Кошелек</th>
            <th>Оклад</th>
            <th>Премия</th>
            <th>Штрафы</th>
            <th>Выплата</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>

      <div className="total-payout">Общая выплата в Emivn: {totalPayout}</div>
      <div className="total-payout">
        Сейчас токенов на контракте: {tokenCount}
      </div>

      <div className="total-bottom">
        <button
          className="connect-button"
          onClick={paySalaries}
          style={{ marginRight: "60px", backgroundColor: "green" }}
        >
          Выплатить всем
        </button>

        <button
          className="connect-button"
          onClick={checkAllTxs}
          style={{ marginRight: "60px" }}
        >
          Все выплаты
        </button>
      </div>
      {showTxsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ width: "400px", textAlign: "center" }}>
              Все выплаты сотрудникам
            </h2>
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Сумма</th>
                    <th>Ссылка</th>
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
                          Перейти
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
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Добавление сотрудника</h2>
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
                    : "ФИО"}
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
                    : "Адрес кошелька"}
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
                    : "Оклад"}
                </label>
              </div>

              {error && <p className="error">{error}</p>}
              <div className="button-group">
                <button className="add-employee-button" onClick={addEmployee}>
                  Добавить сотрудника
                </button>
                <button
                  className="close-modal-button"
                  onClick={handleModalClose}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ textAlign: "center" }}>Редактирование</h2>
            <p>Оставьте 0, если не хотите менять поле</p>
            <div className="employee-form">
              <div className="form-group">
                <label className="label">Оклад</label>
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
                <label>Премия</label>
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
                    : "Премия"}
                </label>
              </div>

              <div className="form-group">
                <label>Штрафы</label>
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
                    : "Штраф"}
                </label>
              </div>

              {error && <p className="error">{error}</p>}
              <div className="button-group">
                <button className="add-employee-button" onClick={saveChanges}>
                  Сохранить изменения
                </button>
                <button
                  className="add-employee-button"
                  onClick={deleteTheEmployee}
                  style={{ backgroundColor: "red" }}
                >
                  Удалить сотрудника
                </button>
              </div>
              <button
                className="close-modal-button"
                onClick={handleModalClose}
                style={{ margin: "auto", marginTop: "10px" }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
