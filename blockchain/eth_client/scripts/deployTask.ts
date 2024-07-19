import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

const main = async (): Promise<any> => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  const TaskManager: ContractFactory = await ethers.getContractFactory(
    "TaskManager"
  );
  const taskManager: Contract = (await TaskManager.deploy()) as Contract;

  const address = await taskManager.getAddress();
  console.log(`taskAssigner deployed to: ${address}`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
