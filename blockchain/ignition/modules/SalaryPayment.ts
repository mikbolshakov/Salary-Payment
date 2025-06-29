import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

// npx hardhat ignition deploy ignition/modules/SalaryPayment.ts --network ethereum_sepolia --verify
const SalaryModule = buildModule('SalaryModule', (m) => {
  const _salaryToken = m.getParameter('_salaryToken');
  const _defaultAdmin = m.getParameter('_defaultAdmin');

  const salaryContractModule = m.contract('SalaryPayment', [_salaryToken, _defaultAdmin]);

  return { salaryContractModule };
});

export default SalaryModule;
