# Salary Payment App

The Salary Payment is a decentralized application (dApp) that simplifies payroll management using blockchain technology. It has seamless integration of smart contracts for secure and transparent employee salary management, a backend indexer with database storage for extended functionality, and a React user-friendly interface for user interaction.

---

## Project Architecture

### Blockchain Layer

- **Tools and Frameworks:**
  - [Hardhat v5](https://hardhat.org/): For smart contract development, testing, and deployment.
  - [Ethers v6](https://docs.ethers.org/v6/): For testing and interacting with the EVM blockchains.
  - [OpenZeppelin v5](https://www.openzeppelin.com/): For security and standardization
- **Smart Contracts:**
  - Written in **Solidity 0.8.28**.
  - Add/remove employees. Assign salaries, bonuses, and penalties.
  - 100% test coverage ensures reliability.
- **ERC20 Token Support:**
  - Used ERC20 token as the currency for salary payments.
  - Pay salaries to all employees in one transaction.

### Backend Layer

- **Technology Stack:**
  - [Node.js](https://nodejs.org/en) and [TypeScript](https://www.typescriptlang.org/): For building a reliable and scalable backend.
  - [PostgreSQL](https://www.postgresql.org/): For storing employee details and transaction history.
- **Functionality:**
  - Acts as an indexer for the blockchain, syncing on-chain data with off-chain storage.
  - Stores additional data (e.g., full names of employees, records of salary payment transactions).
  - Provides RESTful APIs for interacting with employee and transaction data.

### Frontend Layer

- **Technology Stack:**
  - [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/): For building a user-friendly and responsive interface.
  - [MetaMask](https://metamask.io/): For blockchain interactions.
- **Features:**
  - Display a table of employees with search functionality by wallet address and full name.
  - Easy-to-use forms for adding, updating, and removing employees.
  - Comprehensive dashboard displaying:
    - Employee details.
    - Transaction history.
    - Token balances.

---

This project combines blockchain, backend, and frontend technologies to deliver a seamless and transparent solution for salary management, ensuring data consistency and providing an intuitive user experience.
