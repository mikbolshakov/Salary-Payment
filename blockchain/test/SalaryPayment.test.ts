import { ethers, ignition } from 'hardhat';
import tokenAbi from '../ABI/SalaryTokenABI.json';
import { SalaryPayment, SalaryToken } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
import TokenModule from '../ignition/modules/SalTok';
import PaymentModule from '../ignition/modules/SalaryPayment';

describe('SalaryIssuance Test', () => {
  let SalaryToken: SalaryToken;
  let SalaryPayment: SalaryPayment;
  let signers: HardhatEthersSigner[];
  let admin: HardhatEthersSigner;
  let employee1: HardhatEthersSigner;
  let employee2: HardhatEthersSigner;

  before(async () => {
    signers = await ethers.getSigners();
    admin = signers[0];
    employee1 = signers[1];
    employee2 = signers[2];
  });

  it('Deploys Token contract', async () => {
    const { salaryToken } = await ignition.deploy(TokenModule);

    expect(salaryToken.target).to.not.eq(ethers.ZeroAddress);
    expect(salaryToken.target).to.be.properAddress;
    SalaryToken = salaryToken as unknown as SalaryToken;

    const totalSupply = await salaryToken.totalSupply();
    console.log(SalaryToken.target)
    expect(totalSupply).to.equal(ethers.parseEther('1000000'));
  });

  it('Deploys Payment contract', async () => {
    const { payment } = await ignition.deploy(PaymentModule, {
      parameters: {
        PaymentModule: {
          _salaryToken: SalaryToken.target as string,
          _defaultAdmin: admin.address,
        },
      },
    });

    expect(payment.target).to.not.eq(ethers.ZeroAddress);
    expect(payment.target).to.be.properAddress;
    SalaryPayment = payment as unknown as SalaryPayment;
console.log(await SalaryPayment.salaryToken())
    

await SalaryToken.connect(admin).approve(SalaryPayment.target, ethers.parseEther('10000000'));
    await SalaryPayment.depositTokens(ethers.parseEther('10000'));
    const paymentBalance = await SalaryToken.balanceOf(SalaryPayment.target);
    expect(paymentBalance).to.eq(ethers.parseEther('10000'));
  });
  /*
  it('Add employees and check their numbers and wallets', async () => {
    const salary1 = ethers.utils.parseUnits('1000', 6);
    const salary2 = ethers.utils.parseUnits('800', 6);
    const salary3 = ethers.utils.parseUnits('2100', 6);

    // Add employees
    await expect(
      SalaryIssuance.connect(employee2).addEmployee(employee3.address, salary3),
    ).to.be.revertedWith(
      'AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0xd5275b184db1046809daf5623cc0eb88d19be67783a60d79936704ec82cfa491',
    );

    await SalaryIssuance.addEmployee(employee1.address, salary1);
    await SalaryIssuance.addEmployee(employee2.address, salary2);
    await SalaryIssuance.addEmployee(employee3.address, salary3);
    expect(await SalaryIssuance.checkEmployeeSalary(1)).to.eq(salary1);
    expect(await SalaryIssuance.checkEmployeeSalary(2)).to.eq(salary2);
    expect(await SalaryIssuance.checkEmployeeSalary(3)).to.eq(salary3);

    await expect(SalaryIssuance.addEmployee(employee1.address, salary1)).to.be.revertedWith(
      'The employee is already registered',
    );

    // Сheck their numbers
    const employeeNumber1 = await SalaryIssuance.checkEmployeeNumber(employee1.address);
    const employeeNumber2 = await SalaryIssuance.checkEmployeeNumber(employee2.address);
    const employeeNumber3 = await SalaryIssuance.checkEmployeeNumber(employee3.address);
    expect(employeeNumber1).to.equal(1);
    expect(employeeNumber2).to.equal(2);
    expect(employeeNumber3).to.equal(3);

    // Сheck their wallets
    const employeeWallet1 = await SalaryIssuance.checkEmployeeWallet(employeeNumber1);
    const employeeWallet2 = await SalaryIssuance.checkEmployeeWallet(employeeNumber2);
    const employeeWallet3 = await SalaryIssuance.checkEmployeeWallet(employeeNumber3);
    expect(employeeWallet1).to.equal(employee1.address);
    expect(employeeWallet2).to.equal(employee2.address);
    expect(employeeWallet3).to.equal(employee3.address);

    await expect(SalaryIssuance.checkEmployeeWallet(10)).to.be.revertedWith(
      'Employee number does not exist',
    );
    await expect(SalaryIssuance.checkEmployeeBonus(10)).to.be.revertedWith(
      'Employee number does not exist',
    );
    await expect(SalaryIssuance.checkEmployeeSalary(10)).to.be.revertedWith(
      'Employee number does not exist',
    );
    await expect(SalaryIssuance.checkEmployeePenalty(10)).to.be.revertedWith(
      'Employee number does not exist',
    );
  });

  it('Set and check salary, bonuses and penalties for employees', async () => {
    const newSalaryAmount = ethers.utils.parseUnits('1200', 6);
    const penaltyAmount = ethers.utils.parseUnits('700', 6);
    const bonusAmount = ethers.utils.parseUnits('1500', 6);

    // Set salary, bonuses and penalties
    const employeeNumber1 = await SalaryIssuance.checkEmployeeNumber(employee1.address);
    await SalaryIssuance.setEmployeeSalary(employeeNumber1, newSalaryAmount);
    const employeeNumber2 = await SalaryIssuance.checkEmployeeNumber(employee2.address);
    await SalaryIssuance.setEmployeePenalty(employeeNumber2, penaltyAmount);
    const employeeNumber3 = await SalaryIssuance.checkEmployeeNumber(employee3.address);
    await SalaryIssuance.setEmployeeBonus(employeeNumber3, bonusAmount);

    // Check salary, bonuses and penalties
    const updatedSalary = await SalaryIssuance.checkEmployeeSalary(employeeNumber1);
    const updatedPenalty = await SalaryIssuance.checkEmployeePenalty(employeeNumber2);
    const updatedBonus = await SalaryIssuance.checkEmployeeBonus(employeeNumber3);
    expect(updatedPenalty).to.equal(penaltyAmount);
    expect(updatedSalary).to.equal(newSalaryAmount);
    expect(updatedBonus).to.equal(bonusAmount);

    await expect(SalaryIssuance.setEmployeeSalary(10, newSalaryAmount)).to.be.revertedWith(
      'Employee number does not exist',
    );
    await expect(SalaryIssuance.setEmployeeBonus(10, newSalaryAmount)).to.be.revertedWith(
      'Employee number does not exist',
    );
    await expect(SalaryIssuance.setEmployeePenalty(10, newSalaryAmount)).to.be.revertedWith(
      'Employee number does not exist',
    );
  });

  it('Check Access Control and unprofitable employees', async () => {
    const smallAmount = ethers.utils.parseUnits('300', 6);
    const bigAmount = ethers.utils.parseUnits('5000', 6);

    await expect(
      SalaryIssuance.connect(employee1).setEmployeeSalary(1, smallAmount),
    ).to.be.revertedWith(
      'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0xd5275b184db1046809daf5623cc0eb88d19be67783a60d79936704ec82cfa491',
    );
    await expect(
      SalaryIssuance.connect(employee2).setEmployeeBonus(2, smallAmount),
    ).to.be.revertedWith(
      'AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0xd5275b184db1046809daf5623cc0eb88d19be67783a60d79936704ec82cfa491',
    );
    await expect(
      SalaryIssuance.connect(employee3).setEmployeePenalty(1, smallAmount),
    ).to.be.revertedWith(
      'AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0xd5275b184db1046809daf5623cc0eb88d19be67783a60d79936704ec82cfa491',
    );
    await expect(SalaryIssuance.connect(employee3).paySalary()).to.be.revertedWith(
      'AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0xd5275b184db1046809daf5623cc0eb88d19be67783a60d79936704ec82cfa491',
    );

    await expect(SalaryIssuance.setEmployeeSalary(2, smallAmount)).to.be.revertedWith(
      'Unprofitable employee',
    );
    await expect(SalaryIssuance.setEmployeePenalty(1, bigAmount)).to.be.revertedWith(
      'Unprofitable employee',
    );
  });

  it('Calculate payout amount and pay salary', async () => {
    await SalaryIssuance.setEmployeeSalary(1, ethers.utils.parseUnits('12000', 6));
    await expect(SalaryIssuance.paySalary()).to.be.revertedWith(
      "Contract doesn't have enough balance to pay the salary",
    );
    await SalaryIssuance.setEmployeeSalary(1, ethers.utils.parseUnits('1200', 6));

    expect(await SalaryIssuance.calculatePayoutAmount(1)).to.equal(
      ethers.utils.parseUnits('1200', 6),
    );
    expect(await SalaryIssuance.calculatePayoutAmount(2)).to.equal(
      ethers.utils.parseUnits('100', 6),
    );
    expect(await SalaryIssuance.calculatePayoutAmount(3)).to.equal(
      ethers.utils.parseUnits('3600', 6),
    );

    await SalaryIssuance.paySalary();

    expect(await SalaryIssuance.checkEmployeeSalary(1)).to.equal(
      ethers.utils.parseUnits('1200', 6),
    );
    expect(await SalaryIssuance.checkEmployeePenalty(2)).to.equal(0);
    expect(await SalaryIssuance.checkEmployeeBonus(3)).to.equal(0);
  });

  it('Delete employee and pay salary', async () => {
    await expect(SalaryIssuance.connect(employee1).deleteEmployee(1)).to.be.revertedWith(
      'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0xd5275b184db1046809daf5623cc0eb88d19be67783a60d79936704ec82cfa491',
    );
    await SalaryIssuance.deleteEmployee(2);
    await expect(SalaryIssuance.deleteEmployee(10)).to.be.revertedWith(
      'Employee number does not exist',
    );
    await expect(SalaryIssuance.deleteEmployee(2)).to.be.revertedWith('Employee already deleted');

    await SalaryIssuance.paySalary();
  });*/
});
