import { ethers } from "ethers";
import { config } from "dotenv";
import contractAbi from "./ABI/contractAbi.json";
config();

// npx ts-node scripts/salaryPayment.ts
const contractAddress = "0x8F443E8f1715D77d7c0eAa0494c69A782b232245";
const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_MUMBAI);
const admin = new ethers.Wallet(
  process.env.ADMIN_PRIVATE_KEY as string,
  provider
);
const contract = new ethers.Contract(contractAddress, contractAbi, provider);

async function checkIfFirstDayOfMonth() {
  console.log("Check date");
  const currentDate = new Date();
  const currentDay = currentDate.getMinutes(); // getDate();

  if (currentDay === 46) {
    console.log("SALARY DAY!");
    let tx1 = await contract.connect(admin).paySalary({ gasLimit: 1500000 });
    await tx1.wait();
  }
}

// Call the function every 12 hours to check the current date - 12 * 3600 * 1000
setInterval(checkIfFirstDayOfMonth, 1 * 30 * 1000);