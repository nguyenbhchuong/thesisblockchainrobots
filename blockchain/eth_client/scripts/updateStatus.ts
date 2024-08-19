import { BaseContract, ContractFactory, Signer } from "ethers";

const { ethers } = require("hardhat");

const contractAddress = "0xb4B46bdAA835F8E4b4d8e208B6559cD267851051"; // Replace with your deployed contract address
const nodeNumber = 1;

async function main() {
  const TaskManager: ContractFactory = await ethers.getContractFactory(
    "TaskManager"
  );
  const accounts: Signer[] = await ethers.getSigners();

  const taskManager: BaseContract = await TaskManager.attach(contractAddress);
  const taskManagerRunner = taskManager.connect(accounts[nodeNumber]);

  taskManager.on("DoneFindingFreeBots", (freeBotsID: number) => {
    console.log("Free Bots IDs:", freeBotsID);
  });

  // Listen for DoneFindingNewTasks event
  taskManager.on("DoneFindingNewTasks", (unassignedTasksID: number) => {
    console.log("Unassigned Tasks IDs:", unassignedTasksID);
  });

  // Interact with the contract
  console.log("Adding Task");
  let tx = await taskManager.updateTaskStatus(2, 2);
  console.log("check1");
  await tx.wait();
  console.log("check2");
  const value = await taskManager.readTasks();
  console.log("Stored value is:", value);
  // console.log(taskAssigner.interface.getEvent("DoneFindingFreeBots").inputs);
}

// Listen for DoneFindingFreeBots event

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
