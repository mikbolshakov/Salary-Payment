## WagePayments
In this web3 application you can keep track of employees' payroll. Add/delete employees, assign them a salary, bonuses and penalties. Pay salaries with selected tokens from the smart contract address.

### Install
```bash
git clone https://github.com/mikbolshakov/WagePayments.git
cd wagepayments/frontend
npm install
cd ../backend
npm install
cd ../blockchain
npm install
```

### Run
Important! For each of the frontend/backend/blockchain sections, you need to create a .env file and enter the necessary variables. Feel free to ask me a question if a detailed explanation is needed.

First, deploy and verify a smart contract:
You need to specify the address of the admin and the address of the salary token in /scripts/deploy.ts
```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network polygon_mumbai
```

Then, run the server locally to interact with the database
```bash
cd backend
npm run start
```

After that, run the development server and open [localhost:3000](http://localhost:3000) with your browser to see the result:
Also you need to paste contract ABI and token ABI in /src/ABI. You can get ABI by entering the address of the contract and the token [here](https://mumbai.polygonscan.com/)
```bash
cd frontend
npm start
```

### Built with:

#### Backend:
 * [Express](https://expressjs.com/) - minimalistic and flexible web framework for Node.js applications;
 * [MongoDB](https://www.mongodb.com/) for cloud database and data services;
 * [CORS](https://expressjs.com/en/resources/middleware/cors.html) for providing a Connect/Express middleware that can be used to enable CORS with various options;
 * [Express-validator](https://express-validator.github.io/docs) for validate and sanitize your express requests.

#### Frontend:
 * [React](https://reactjs.org/) - JavaScript library for building user interfaces;
 * [MetaMask](https://metamask.io/) serves as a digital wallet and gateway to the decentralized web;
 * [Ethers](https://docs.ethers.org/v5/) for interaction with accounts in the blockchain;
 * [Axios](https://axios-http.com/) for simple HTTP client interaction based on promises for browser and node.js.
 
 #### Blockchain:
 * [Hardhat](https://hardhat.org/) - development environment for Ethereum software;
 * [OpenZeppelin](https://www.openzeppelin.com/) for provide security products for smart contracts;
 * [Mumbai](https://faucet.polygon.technology/) - the testnet of the Polygon network, which replicates the Polygon mainnet.


### Development
Want to contribute? Great!

To fix a bug or enhance an existing module, follow these steps:

- Fork the repo
- Create a new branch (`git checkout -b improve-feature`)
- Make the appropriate changes in the files
- Add changes to reflect the changes made
- Commit your changes (`git commit -am 'Improve feature'`)
- Push to the branch (`git push origin improve-feature`)
- Create a Pull Request 
