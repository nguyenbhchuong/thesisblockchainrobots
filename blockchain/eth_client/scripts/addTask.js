const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x624ECbaA025d77FFe460dD5020932cC2CEF95A1C"; // Replace with your deployed contract address
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
  console.log("Adding Task");
  let tx = await taskManager.addTask("A", "B");
  console.log("check1");
  await tx.wait();
  console.log("check2");
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
