import { ethers, ignition } from 'hardhat';
import TokenModule from '../ignition/modules/SalaryToken';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
import { SalaryToken } from '../typechain-types';
import { parseEther } from 'ethers';

describe('Token E2E test', () => {
  let token: SalaryToken;
  let admin: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  before(async () => {
    const signers = await ethers.getSigners();
    [admin, user1, user2] = signers;
  });

  it('Deploys Token contract', async () => {
    const { tokenContractModule } = await ignition.deploy(TokenModule, {
      parameters: {
        TokenModule: {
          recipient: user1.address,
          initialOwner: admin.address,
        },
      },
    });

    expect(tokenContractModule.target).to.not.eq(ethers.ZeroAddress);
    expect(tokenContractModule.target).to.be.properAddress;
    token = tokenContractModule as unknown as SalaryToken;

    expect(await token.totalSupply()).to.equal(parseEther('1000000'));
    expect(await token.balanceOf(user1.address)).to.equal(parseEther('1000000'));
  });

  it('Returns correct owner address', async () => {
    const owner = await token.owner();
    expect(owner).to.equal(admin.address);
  });

  it('Owner can mint tokens', async () => {
    const balanceBefore = await token.balanceOf(user2.address);
    expect(balanceBefore).to.equal(0);

    const mintAmount = parseEther('5000');
    await expect(token.connect(admin).mint(user2.address, mintAmount))
      .to.emit(token, 'Transfer')
      .withArgs(ethers.ZeroAddress, user2.address, mintAmount);

    const balance = await token.balanceOf(user2.address);
    expect(balance).to.equal(mintAmount);
  });

  it('Owner can pause and unpause transfers; transfers blocked while paused', async () => {
    await token.connect(admin).pause();
    await expect(token.connect(user1).transfer(user2.address, 1000)).to.be.revertedWithCustomError(
      token,
      'EnforcedPause',
    );

    await token.connect(admin).unpause();
    await token.connect(user1).transfer(user2.address, parseEther('33'));
    const balance = await token.balanceOf(user2.address);
    expect(balance).to.be.equal(parseEther('5033'));
  });

  it('Owner can add/remove from blacklist and blocks transfers accordingly', async () => {
    await token.connect(admin).addBlackList(user2.address);

    const isBlacklisted = await token.getBlackListStatus(user2.address);
    expect(isBlacklisted).to.equal(true);

    await expect(token.connect(user2).transfer(user1.address, 1)).to.be.revertedWith(
      'Sender is blacklisted',
    );

    await expect(token.connect(user1).transfer(user2.address, 1)).to.be.revertedWith(
      'Recipient is blacklisted',
    );

    await token.connect(admin).removeBlackList(user2.address);

    const afterRemoval = await token.getBlackListStatus(user2.address);
    expect(afterRemoval).to.equal(false);
  });

  it('User can burn own tokens', async () => {
    const burnAmount = parseEther('100');
    const balanceBefore = await token.balanceOf(user1.address);

    await token.connect(user1).burn(burnAmount);

    const balanceAfter = await token.balanceOf(user1.address);
    expect(balanceAfter).to.equal(balanceBefore - burnAmount);
  });

  it('Owner can burn tokens from approved user', async () => {
    const burnAmount = parseEther('33');

    await token.connect(user2).approve(admin.address, burnAmount);
    await token.connect(admin).burnFrom(user2.address, burnAmount);

    const balanceAfter = await token.balanceOf(user2.address);
    expect(balanceAfter).to.be.eq(parseEther('5000'));
  });

  it('Should revert mint by non-owner', async () => {
    await expect(token.connect(user1).mint(user1.address, 1))
      .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
      .withArgs(user1.address);
  });

  it('Should revert pause/unpause by non-owner', async () => {
    await expect(token.connect(user1).pause())
      .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
      .withArgs(user1.address);
    await expect(token.connect(user1).unpause())
      .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
      .withArgs(user1.address);
  });

  it('Should revert addBlackList/removeBlackList by non-owner', async () => {
    await expect(token.connect(user1).addBlackList(user2.address))
      .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
      .withArgs(user1.address);
    await expect(token.connect(user1).removeBlackList(user2.address))
      .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
      .withArgs(user1.address);
  });

  it('Transfer ownership and verify new owner', async () => {
    await token.connect(admin).transferOwnership(user1.address);

    const newOwner = await token.owner();
    expect(newOwner).to.equal(user1.address);

    await token.connect(user1).mint(user2.address, parseEther('100'));

    await expect(token.connect(admin).mint(user2.address, 1))
      .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
      .withArgs(admin.address);

    expect(await token.balanceOf(user2.address)).to.equal(parseEther('5100'));
  });

  it('Should block transfer to zero address', async () => {
    await expect(token.connect(user2).transfer(ethers.ZeroAddress, 1))
      .to.be.revertedWithCustomError(token, 'ERC20InvalidReceiver')
      .withArgs(ethers.ZeroAddress);
  });

  it('Should allow transfer of 0 tokens', async () => {
    const tx = await token.connect(user2).transfer(user1.address, 0);
    await expect(tx).to.emit(token, 'Transfer').withArgs(user2.address, user1.address, 0);
  });

  it('Should block transferFrom if sender is blacklisted', async () => {
    await token.connect(user1).approve(admin.address, 1);
    await token.connect(user1).addBlackList(user1.address);

    await expect(
      token.connect(admin).transferFrom(user1.address, user2.address, 1),
    ).to.be.revertedWith('Sender is blacklisted');

    await token.connect(user1).removeBlackList(user1.address);
  });

  it('Should block transferFrom if recipient is blacklisted', async () => {
    await token.connect(user1).addBlackList(user2.address);

    await token.connect(user1).approve(admin.address, 1);
    await expect(
      token.connect(admin).transferFrom(user1.address, user2.address, 1),
    ).to.be.revertedWith('Recipient is blacklisted');

    await token.connect(user1).approve(admin.address, 0); // cleanup
    await token.connect(user1).removeBlackList(user2.address);
  });

  it('Should allow multiple mint and burn operations', async () => {
    const amount = parseEther('10');

    for (let i = 0; i < 3; i++) {
      await token.connect(user2).approve(admin.address, amount);
      await token.connect(admin).burnFrom(user2.address, amount);
      await token.connect(user1).mint(user2.address, amount);
    }

    const finalBalance = await token.balanceOf(user2.address);
    expect(finalBalance).to.equal(parseEther('5100'));
  });

  it('Should allow user to blacklist self (not recommended)', async () => {
    await token.connect(user1).addBlackList(user1.address);
    const isBlacklisted = await token.getBlackListStatus(user1.address);
    expect(isBlacklisted).to.equal(true);

    await token.connect(user1).removeBlackList(user1.address);
  });

  it('Pause, blacklist, unpause sequence should still block blacklisted', async () => {
    await token.connect(user1).pause();
    await token.connect(user1).addBlackList(user2.address);
    await token.connect(user1).unpause();

    await expect(token.connect(user2).transfer(user1.address, 1)).to.be.revertedWith(
      'Sender is blacklisted',
    );

    await token.connect(user1).removeBlackList(user2.address);
  });

  it('Renounce ownership and verify contract has no owner', async () => {
    await token.connect(user1).renounceOwnership();

    const finalOwner = await token.owner();
    expect(finalOwner).to.equal(ethers.ZeroAddress);

    await expect(token.connect(user1).pause())
      .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
      .withArgs(user1.address);
  });
});
