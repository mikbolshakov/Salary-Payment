import { ethers, ignition } from 'hardhat';
import { SalaryPayment, SalaryToken } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
import { parseEther } from 'ethers';
import TokenModule from '../ignition/modules/SalaryToken';
import PaymentModule from '../ignition/modules/SalaryPayment';

describe('SalaryPayment Test', () => {
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
    expect(totalSupply).to.equal(parseEther('1000000'));
  });

  it('Deploy Payment contract', async () => {
    const depositAmount = parseEther('10000');

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

    await SalaryToken.connect(admin).approve(SalaryPayment.target, depositAmount);
    await SalaryPayment.depositTokens(depositAmount);

    const paymentContractBalance = await SalaryToken.balanceOf(SalaryPayment.target);
    expect(paymentContractBalance).to.eq(depositAmount);
  });

  it('Add employees and check their salary', async () => {
    const salary1 = parseEther('1000');
    const salary2 = parseEther('800');
    const salary3 = parseEther('2100');

    expect(SalaryPayment.connect(employee2).addEmployee(employee3.address, salary3)).to.be
      .revertedWithCustomError; // onlyRole

    expect(await SalaryPayment.getEmployeesCount()).to.eq(0);
    await SalaryPayment.addEmployee(employee1.address, salary1);
    await SalaryPayment.addEmployee(employee2.address, salary2);
    await SalaryPayment.addEmployee(employee3.address, salary3);
    expect(await SalaryPayment.getEmployeesCount()).to.eq(3);

    expect(await SalaryPayment.getEmployeeSalary(employee1.address)).to.deep.equal(salary1);
    expect(await SalaryPayment.getEmployeeSalary(employee2.address)).to.deep.equal(salary2);
    expect(await SalaryPayment.getEmployeeSalary(employee3.address)).to.deep.equal(salary3);

    await expect(SalaryPayment.addEmployee(employee1.address, salary1)).to.be.revertedWith(
      'Employee already exists',
    );
    await expect(SalaryPayment.addEmployee(admin.address, 0)).to.be.revertedWith(
      'Salary should be more than 0',
    );
    await expect(SalaryPayment.getEmployeeSalary(admin.address)).to.be.revertedWith(
      'Employee does not exist',
    );
    await expect(SalaryPayment.getEmployeePenalty(admin.address)).to.be.revertedWith(
      'Employee does not exist',
    );
    await expect(SalaryPayment.getEmployeeBonus(admin.address)).to.be.revertedWith(
      'Employee does not exist',
    );
  });

  it('Set and check salary, bonuses and penalties for employees', async () => {
    const newSalaryAmount = parseEther('1200');
    const penaltyAmount = parseEther('700');
    const bonusAmount = parseEther('1500');

    // Set salary, bonuses and penalties
    await SalaryPayment.setEmployeeSalary(employee1.address, newSalaryAmount);
    await SalaryPayment.setEmployeePenalty(employee2.address, penaltyAmount);
    await SalaryPayment.setEmployeeBonus(employee3.address, bonusAmount);

    expect(SalaryPayment.connect(employee2).setEmployeeSalary(employee3.address, newSalaryAmount))
      .to.be.revertedWithCustomError; // onlyRole
    expect(SalaryPayment.connect(employee2).setEmployeePenalty(employee3.address, newSalaryAmount))
      .to.be.revertedWithCustomError; // onlyRole
    expect(SalaryPayment.connect(employee2).setEmployeeBonus(employee3.address, newSalaryAmount)).to
      .be.revertedWithCustomError; // onlyRole

    // Check salary, bonuses and penalties
    expect(await SalaryPayment.getEmployeeSalary(employee1.address)).to.deep.equal(newSalaryAmount);
    expect(await SalaryPayment.getEmployeePenalty(employee2.address)).to.deep.equal(penaltyAmount);
    expect(await SalaryPayment.getEmployeeBonus(employee3.address)).to.deep.equal(bonusAmount);

    await expect(
      SalaryPayment.setEmployeeSalary(admin.address, newSalaryAmount),
    ).to.be.revertedWith('Employee does not exist');
    await expect(SalaryPayment.setEmployeeBonus(admin.address, newSalaryAmount)).to.be.revertedWith(
      'Employee does not exist',
    );
    await expect(
      SalaryPayment.setEmployeePenalty(admin.address, newSalaryAmount),
    ).to.be.revertedWith('Employee does not exist');
  });

  it('Check unprofitable employees', async () => {
    const smallAmount = parseEther('300');
    const bigAmount = parseEther('5000');

    await expect(
      SalaryPayment.setEmployeeSalary(employee2.address, smallAmount),
    ).to.be.revertedWith('Unprofitable employee');
    await expect(SalaryPayment.setEmployeePenalty(employee1.address, bigAmount)).to.be.revertedWith(
      'Unprofitable employee',
    );
  });

  it('Calculate payout amount and pay salary', async () => {
    await SalaryPayment.setEmployeeSalary(employee1.address, parseEther('1000000000'));
    await expect(SalaryPayment.payAllSalaries()).to.be.revertedWith(
      'Insufficient contract balance',
    );
    await SalaryPayment.setEmployeeSalary(employee1.address, parseEther('1200'));

    expect(SalaryPayment.connect(employee2).payAllSalaries()).to.be.revertedWithCustomError; // onlyRole

    await SalaryPayment.payAllSalaries();
    expect(await SalaryPayment.getEmployeeSalary(employee1.address)).to.deep.equal(
      parseEther('1200'),
    );
    expect(await SalaryPayment.getEmployeePenalty(employee2.address)).to.deep.equal(0);
    expect(await SalaryPayment.getEmployeeBonus(employee3.address)).to.deep.equal(0);
  });

  it('Remove employee', async () => {
    expect(SalaryPayment.connect(employee2).removeEmployee(employee3.address)).to.be
      .revertedWithCustomError; // onlyRole

    expect(await SalaryPayment.getEmployeesCount()).to.eq(3);
    await SalaryPayment.removeEmployee(employee2.address);
    expect(await SalaryPayment.getEmployeesCount()).to.eq(2);

    await expect(SalaryPayment.removeEmployee(admin.address)).to.be.revertedWith(
      'Employee does not exist',
    );
  });
});
