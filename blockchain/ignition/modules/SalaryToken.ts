import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

// npx hardhat ignition deploy ignition/modules/SalaryToken.ts --network ethereum_sepolia --verify
const TokenModule = buildModule('TokenModule', (m) => {
  const recipient = m.getParameter('recipient');
  const initialOwner = m.getParameter('initialOwner');

  const tokenContractModule = m.contract('SalaryToken', [recipient, initialOwner]);

  return { tokenContractModule };
});

export default TokenModule;
