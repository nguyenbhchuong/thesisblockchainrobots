//this function is used to trace back all transactions and blocks

const { ethers } = require("hardhat");

async function main() {
  const blockNumber = await ethers.provider.getBlockNumber();

  for (let i = 0; i < blockNumber; i++) {
    const block = await ethers.provider.getBlock(i);

    if (block.transactions.length === 0) {
      // console.log("No transactions in the latest block.");
    } else {
      console.log("Transactions in the latest block:", block.transactions);
      console.log(block);

      for (const txHash of block.transactions) {
        const transaction = await ethers.provider.getTransaction(txHash);
        console.log(`Transaction details for ${txHash}:`, transaction);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error fetching block:", error);
    process.exit(1);
  });
