//this program is for TESTING validation with blockchain

import { BaseContract, ContractFactory, Signer } from "ethers";

const { ethers } = require("hardhat");

const contractAddress = "0xb4B46bdAA835F8E4b4d8e208B6559cD267851051"; // Replace with your deployed contract address
const nodeNumber = 0;

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

  taskManager.on("DoneFindingValidatingTasks", (unassignedTasksID: number) => {
    console.log("Validating Tasks IDs:", unassignedTasksID);
  });

  taskManager.on("Check", (check: number) => {
    console.log("Check result:", check);
  });
  taskManager.on("CheckU", (check: number) => {
    console.log("CheckU result:", check);
  });

  // Interact with the contract
  console.log("Adding Task");
  let tx = await taskManagerRunner.reportGoods(["ABC", "CCC", "KLC"], "D2");
  console.log("check1");
  await tx.wait();
  console.log("check2");
  const tasks = await taskManagerRunner.readTasks();
  const robots = await taskManagerRunner.readRobots();

  console.log("Stored tasks is:", tasks);
  console.log("Stored robots is:", robots);
  // console.log(taskAssigner.interface.getEvent("DoneFindingFreeBots").inputs);
}

// Listen for DoneFindingFreeBots event

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
