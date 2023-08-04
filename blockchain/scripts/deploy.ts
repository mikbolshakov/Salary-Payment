import { ethers } from "hardhat";
import hre from "hardhat";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

// npx hardhat run scripts/deploy.ts --network polygon_mumbai
async function main() {
  const defaultAdmin = "0x3B4e3270eA25bdf0826AF34cE456854b88DE9b62";
  const salaryToken = "0x6966b2a543E34E69Cf1c7840137FfD2d8a09e834";

  const SalaryIssuance = await ethers.getContractFactory("SalaryIssuance");
  const salaryIssuance = await SalaryIssuance.deploy(salaryToken, defaultAdmin);

  await salaryIssuance.deployed();

  console.log(`Staking deployed to ${salaryIssuance.address}`);

  await new Promise((resolve) => setTimeout(resolve, 60000));

  await hre.run("verify:verify", {
    address: salaryIssuance.address,
    constructorArguments: [salaryToken, defaultAdmin],
    contract: "contracts/SalaryIssuance.sol:SalaryIssuance",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
