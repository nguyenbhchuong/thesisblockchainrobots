const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x422A3492e218383753D8006C7Bfa97815B44373F"; // Replace with your deployed contract address
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

  const value = await taskManager.readTasks();
  console.log("Stored value is:", value);
  // console.log(taskManager.interface.getEvent("DoneFindingFreeBots").inputs);
}

// Listen for DoneFindingFreeBots event

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
