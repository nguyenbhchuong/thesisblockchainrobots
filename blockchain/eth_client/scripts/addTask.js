const { ethers } = require("hardhat");
const { contractAddress } = require("./contractAddress");

async function main() {
  // const contractAddress = "0xb4B46bdAA835F8E4b4d8e208B6559cD267851051"; // Replace with your deployed contract address
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
  let tx = await taskManager.addTask(
    "LIVE",
    "T1",
    "T1",
    Math.round(Date.now() / 1000)
  );
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
