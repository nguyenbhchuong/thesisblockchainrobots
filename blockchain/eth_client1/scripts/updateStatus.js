const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xb4B46bdAA835F8E4b4d8e208B6559cD267851051"; // Replace with your deployed contract address
  const TaskAssigner = await ethers.getContractFactory("TaskAssigner");
  const taskAssigner = await TaskAssigner.attach(contractAddress);


  taskAssigner.on("DoneFindingFreeBots", (freeBotsID) => {
    console.log("Free Bots IDs:", freeBotsID);
  });
  
  // Listen for DoneFindingNewTasks event
  taskAssigner.on("DoneFindingNewTasks", (unassignedTasksID) => {
    console.log("Unassigned Tasks IDs:", unassignedTasksID);
  });

  // Interact with the contract
  console.log("Adding Task");
  let tx = await taskAssigner.updateTaskStatus(2, 5);
  console.log('check1');
  await tx.wait();
  console.log('check2');
  const value = await taskAssigner.readTasks();
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
