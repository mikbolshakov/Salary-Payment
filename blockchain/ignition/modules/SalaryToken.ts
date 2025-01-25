import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

// npx hardhat ignition deploy ignition/modules/SalaryToken.ts --network ethereum_sepolia --verify
const TokenModule = buildModule('TokenModule', (m) => {
  const salaryToken = m.contract('SalaryToken', []);

  return { salaryToken };
});

export default TokenModule;
