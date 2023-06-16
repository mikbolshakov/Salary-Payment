import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      forking: {
        url: `${process.env.PROVIDER}`,
        blockNumber: 17321000,
      },
    },
    polygon_mumbai: {
      url: `${process.env.POLYGON_MUMBAI}`,
      accounts: [<string>process.env.ADMIN_PRIVATE_KEY],
    },
  },
};

export default config;
