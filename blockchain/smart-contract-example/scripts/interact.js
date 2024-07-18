const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x17435ccE3d1B4fA2e5f8A08eD921D57C6762A180"; // Replace with your deployed contract address
  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.attach(contractAddress);

  // Interact with the contract
  console.log("Setting value to 42...");
  let tx = await counter.inc();
  console.log('check1');
  await tx.wait();
  console.log('check2');
  const value = await counter.getNumber();
  console.log("Stored value is:", value.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
