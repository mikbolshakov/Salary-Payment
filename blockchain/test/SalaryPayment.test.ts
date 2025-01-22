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
  let employee3: HardhatEthersSigner;

  before(async () => {
    signers = await ethers.getSigners();
    admin = signers[0];
    employee1 = signers[1];
    employee2 = signers[2];
    employee3 = signers[3];
  });

  it('Deploy Token contract', async () => {
    const { salaryToken } = await ignition.deploy(TokenModule);

    expect(salaryToken.target).to.not.eq(ethers.ZeroAddress);
    expect(salaryToken.target).to.be.properAddress;
    SalaryToken = salaryToken as unknown as SalaryToken;

    const totalSupply = await salaryToken.totalSupply();
    expect(totalSupply).to.equal(ethers.parseEther('1000000'));
  });

  it('Deploy Payment contract', async () => {
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

    await SalaryToken.connect(admin).approve(SalaryPayment.target, ethers.parseEther('10000000'));
    await SalaryPayment.depositTokens(ethers.parseEther('10000'));
    const paymentBalance = await SalaryToken.balanceOf(SalaryPayment.target);
    expect(paymentBalance).to.eq(ethers.parseEther('10000'));
  });

  it('Add employees and check their salary', async () => {
    const salary1 = ethers.parseUnits('1000', 6);
    const salary2 = ethers.parseUnits('800', 6);
    const salary3 = ethers.parseUnits('2100', 6);

    expect(SalaryPayment.connect(employee2).addEmployee(employee3.address, salary3)).to.be
      .revertedWithCustomError; // onlyRole

    expect(await SalaryPayment.getEmployeeCount()).to.eq(0);
    await SalaryPayment.addEmployee(employee1.address, salary1);
    await SalaryPayment.addEmployee(employee2.address, salary2);
    await SalaryPayment.addEmployee(employee3.address, salary3);
    expect(await SalaryPayment.getEmployeeCount()).to.eq(3);

    expect(await SalaryPayment.getEmployeeDetails(employee1.address)).to.deep.equal([
      salary1,
      0n,
      0n,
    ]);
    expect(await SalaryPayment.getEmployeeDetails(employee2.address)).to.deep.equal([
      salary2,
      0n,
      0n,
    ]);
    expect(await SalaryPayment.getEmployeeDetails(employee3.address)).to.deep.equal([
      salary3,
      0n,
      0n,
    ]);

    await expect(SalaryPayment.addEmployee(employee1.address, salary1)).to.be.revertedWith(
      'Employee already exists',
    );
    await expect(SalaryPayment.addEmployee(admin.address, 0)).to.be.revertedWith(
      'Salary should be more than 0',
    );
    await expect(SalaryPayment.getEmployeeDetails(admin.address)).to.be.revertedWith(
      'Employee does not exist',
    );
  });
  /*
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
