import { ethers, ignition } from 'hardhat';
import TokenModule from '../ignition/modules/SalaryToken';
import SalaryModule from '../ignition/modules/SalaryPayment';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
import { SalaryToken, SalaryPayment } from '../typechain-types';
import { parseEther } from 'ethers';

describe('Salary E2E test', () => {
  let token: SalaryToken;
  let salary: SalaryPayment;
  let admin: HardhatEthersSigner;
  let employee1: HardhatEthersSigner;
  let employee2: HardhatEthersSigner;
  let employee3: HardhatEthersSigner;

  before(async () => {
    const signers = await ethers.getSigners();
    [admin, employee1, employee2, employee3] = signers;
  });

  it('Deploys Token contract and checks initial supply', async () => {
    const { tokenContractModule } = await ignition.deploy(TokenModule, {
      parameters: {
        TokenModule: {
          recipient: admin.address,
          initialOwner: admin.address,
        },
      },
    });

    expect(tokenContractModule.target).to.not.equal(ethers.ZeroAddress);
    expect(tokenContractModule.target).to.be.properAddress;

    token = tokenContractModule as unknown as SalaryToken;

    expect(await token.totalSupply()).to.equal(parseEther('1000000'));
    expect(await token.balanceOf(admin.address)).to.equal(parseEther('1000000'));
  });

  it('Deploys Salary contract, grants role and funds salary contract', async () => {
    const { salaryContractModule } = await ignition.deploy(SalaryModule, {
      parameters: {
        SalaryModule: {
          _salaryToken: token.target.toString(),
          _defaultAdmin: admin.address,
        },
      },
    });

    expect(salaryContractModule.target).to.not.equal(ethers.ZeroAddress);
    expect(salaryContractModule.target).to.be.properAddress;

    salary = salaryContractModule as unknown as SalaryPayment;

    await salary.grantRole(await salary.ADMIN_ROLE(), admin.address);
    await token.connect(admin).transfer(salary.target, parseEther('10000'));

    expect(await token.balanceOf(salary.target)).to.equal(parseEther('10000'));
  });

  it('Add employees and check their salary', async () => {
    const salaryAmount1 = parseEther('1000');
    const salaryAmount2 = parseEther('800');
    const salaryAmount3 = parseEther('2100');

    await expect(
      salary.connect(employee2).addEmployee(employee3.address, salaryAmount3),
    ).to.be.revertedWithCustomError(salary, 'AccessControlUnauthorizedAccount');

    expect(await salary.getEmployeesCount()).to.equal(0);

    await salary.addEmployee(employee1.address, salaryAmount1);
    await salary.addEmployee(employee2.address, salaryAmount2);
    await salary.addEmployee(employee3.address, salaryAmount3);

    expect(await salary.getEmployeesCount()).to.equal(3);
    expect(await salary.getEmployeeSalary(employee1.address)).to.equal(salaryAmount1);
    expect(await salary.getEmployeeSalary(employee2.address)).to.equal(salaryAmount2);
    expect(await salary.getEmployeeSalary(employee3.address)).to.equal(salaryAmount3);

    await expect(salary.addEmployee(employee1.address, salaryAmount1)).to.be.revertedWith(
      'Employee already exists',
    );
    await expect(salary.addEmployee(admin.address, 0)).to.be.revertedWith(
      'Salary should be more than 0',
    );

    await expect(salary.getEmployeeSalary(admin.address)).to.be.revertedWith(
      'Employee does not exist',
    );
    await expect(salary.getEmployeePenalty(admin.address)).to.be.revertedWith(
      'Employee does not exist',
    );
    await expect(salary.getEmployeeBonus(admin.address)).to.be.revertedWith(
      'Employee does not exist',
    );
  });

  it('Set and check salary, bonuses and penalties for employees', async () => {
    const newSalaryAmount = parseEther('1200');
    const penaltyAmount = parseEther('700');
    const bonusAmount = parseEther('1500');

    // Set salary, bonuses and penalties
    await salary.setEmployeeSalary(employee1.address, newSalaryAmount);
    await salary.setEmployeePenalty(employee2.address, penaltyAmount);
    await salary.setEmployeeBonus(employee3.address, bonusAmount);

    await expect(
      salary.connect(employee2).setEmployeeSalary(employee3.address, newSalaryAmount),
    ).to.be.revertedWithCustomError(salary, 'AccessControlUnauthorizedAccount');

    await expect(
      salary.connect(employee2).setEmployeePenalty(employee3.address, newSalaryAmount),
    ).to.be.revertedWithCustomError(salary, 'AccessControlUnauthorizedAccount');

    await expect(
      salary.connect(employee2).setEmployeeBonus(employee3.address, newSalaryAmount),
    ).to.be.revertedWithCustomError(salary, 'AccessControlUnauthorizedAccount');

    // Check salary, bonuses and penalties
    expect(await salary.getEmployeeSalary(employee1.address)).to.equal(newSalaryAmount);
    expect(await salary.getEmployeePenalty(employee2.address)).to.equal(penaltyAmount);
    expect(await salary.getEmployeeBonus(employee3.address)).to.equal(bonusAmount);

    await expect(salary.setEmployeeSalary(admin.address, newSalaryAmount)).to.be.revertedWith(
      'Employee does not exist',
    );
    await expect(salary.setEmployeeBonus(admin.address, newSalaryAmount)).to.be.revertedWith(
      'Employee does not exist',
    );
    await expect(salary.setEmployeePenalty(admin.address, newSalaryAmount)).to.be.revertedWith(
      'Employee does not exist',
    );
  });

  it('Check unprofitable employees', async () => {
    const tooLowSalary = parseEther('300');
    const tooBigPenalty = parseEther('5000');

    await expect(salary.setEmployeeSalary(employee2.address, tooLowSalary)).to.be.revertedWith(
      'Unprofitable employee',
    );

    await expect(salary.setEmployeePenalty(employee1.address, tooBigPenalty)).to.be.revertedWith(
      'Unprofitable employee',
    );
  });

  it('Calculate payout amount and pay salary', async () => {
    const hugeSalary = parseEther('1000000000');

    await salary.setEmployeeSalary(employee1.address, hugeSalary);
    await expect(salary.payAllSalaries()).to.be.revertedWith('Insufficient contract balance');

    await salary.setEmployeeSalary(employee1.address, parseEther('1200'));

    await expect(salary.connect(employee2).payAllSalaries()).to.be.revertedWithCustomError(
      salary,
      'AccessControlUnauthorizedAccount',
    );

    await salary.payAllSalaries();

    expect(await salary.getEmployeeSalary(employee1.address)).to.equal(parseEther('1200'));
    expect(await salary.getEmployeePenalty(employee2.address)).to.equal(0);
    expect(await salary.getEmployeeBonus(employee3.address)).to.equal(0);
  });

  it('Remove employee', async () => {
    await expect(
      salary.connect(employee2).removeEmployee(employee3.address),
    ).to.be.revertedWithCustomError(salary, 'AccessControlUnauthorizedAccount');

    expect(await salary.getEmployeesCount()).to.equal(3);
    await salary.removeEmployee(employee2.address);
    expect(await salary.getEmployeesCount()).to.equal(2);

    await expect(salary.removeEmployee(admin.address)).to.be.revertedWith(
      'Employee does not exist',
    );
  });

  it('Pauses and unpauses contract correctly', async () => {
    await salary.connect(admin).pause();
    expect(await salary.paused()).to.equal(true);

    await expect(salary.payAllSalaries()).to.be.revertedWithCustomError(salary, 'EnforcedPause');
    await expect(salary.addEmployee(employee3.address, 1)).to.be.revertedWithCustomError(
      salary,
      'EnforcedPause',
    );
    await expect(salary.removeEmployee(employee3.address)).to.be.revertedWithCustomError(
      salary,
      'EnforcedPause',
    );
    await expect(salary.setEmployeeSalary(employee1.address, 1)).to.be.revertedWithCustomError(
      salary,
      'EnforcedPause',
    );
    await expect(salary.setEmployeeBonus(employee1.address, 1)).to.be.revertedWithCustomError(
      salary,
      'EnforcedPause',
    );
    await expect(salary.setEmployeePenalty(employee1.address, 1)).to.be.revertedWithCustomError(
      salary,
      'EnforcedPause',
    );

    await salary.connect(admin).unpause();
    expect(await salary.paused()).to.equal(false);
  });

  it('Only accounts with PAUSER_ROLE can pause and unpause', async () => {
    await expect(salary.connect(employee1).pause()).to.be.revertedWithCustomError(
      salary,
      'AccessControlUnauthorizedAccount',
    );

    await expect(salary.connect(employee1).unpause()).to.be.revertedWithCustomError(
      salary,
      'AccessControlUnauthorizedAccount',
    );
  });
});
