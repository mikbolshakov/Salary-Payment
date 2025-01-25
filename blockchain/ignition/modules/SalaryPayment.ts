import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const SALARY_TOKEN = '0x2472eAf4728C3633c10CB460A59B6762cdd5e9D5';
const DEFAULT_ADMIN = '0x6ae19a226A6Cec3E29D5dfC90C2bd6640d8d77b9';

// npx hardhat ignition deploy ignition/modules/SalaryPayment.ts --network ethereum_sepolia --verify
const PaymentModule = buildModule('PaymentModule', (m) => {
  const salaryToken = m.getParameter('_salaryToken', SALARY_TOKEN);
  const defaultAdmin = m.getParameter('_defaultAdmin', DEFAULT_ADMIN);

  const payment = m.contract('SalaryPayment', [salaryToken, defaultAdmin]);

  return { payment };
});

export default PaymentModule;
