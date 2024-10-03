//this program is used for reading tasks and robots for debugging

const { ethers } = require("hardhat");
const { contractAddress } = require("./contractAddress");

async function main() {
  // const contractAddress = "0xEE0fCB8E5cCAD0b4197BAabd633333886f5C364d"; // Replace with your deployed contract address
  const TaskManager = await ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.attach(contractAddress);

  taskManager.on("DoneFindingFreeBots", (freeBotsID) => {
    console.log("Free Bots IDs:", freeBotsID);
  });

  // Listen for DoneFindingNewTasks event
  taskManager.on("DoneFindingNewTasks", (unassignedTasksID) => {
    console.log("Unassigned Tasks IDs:", unassignedTasksID);
  });

  // Interact with the contract

  const tasks = await taskManager.readTasks();
  const robots = await taskManager.readRobots();

  console.log("Stored tasks is:", tasks);
  console.log("Stored robots is:", robots);
  // console.log(taskManager.interface.getEvent("DoneFindingFreeBots").inputs);
}

// Listen for DoneFindingFreeBots event

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
