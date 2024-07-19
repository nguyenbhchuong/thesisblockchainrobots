const ROSLIB = require("roslib");
const { ethers } = require("hardhat");

// async function setup() {
//     //setup blockchain
//     const contractAddress = "0xb4B46bdAA835F8E4b4d8e208B6559cD267851051"; // Replace with your deployed contract address
//     const TaskAssigner = await ethers.getContractFactory("TaskAssigner");
//     const taskAssigner = await TaskAssigner.attach(contractAddress);

//     taskAssigner.on("DoneFindingFreeBots", (freeBotsID) => {
//       console.log("Free Bots IDs:", freeBotsID);
//     });

//     // Listen for DoneFindingNewTasks event
//     taskAssigner.on("DoneFindingNewTasks", (unassignedTasksID) => {
//       console.log("Unassigned Tasks IDs:", unassignedTasksID);
//     });

//     //ROS setup
//     let ros = new ROSLIB.Ros({url:'ws://localhost:9090'});

//     ros.on('connection', function (){
//         console.log('successfully connected!');
//         // pulish();
//     })

//     ros.on('error', (error) => {
//         console.error(error)
//     })

//     ros.on('close', () => {
//         console.log('connection closed');
//     })

//     return {
//         taskAssigner,
//         ros
//     }
// }

// async function blockchainInterface() {
//     // Interact with the contract
//     console.log("Adding Task");
//     let tx = await taskAssigner.addTask("A", "B");
//     console.log('check1');
//     await tx.wait();
//     console.log('check2');
//     const value = await taskAssigner.getOwnTask();
//     console.log("Stored value is:", value);
//     // console.log(taskAssigner.interface.getEvent("DoneFindingFreeBots").inputs);
//   }

async function getTask() {
  const value = await taskAssigner.getOwnTask();
  console.log("get task result", value);
  // let message = new ROSLIB.Message({data: 'AtoB'});
  // taskAssign.publish(message);
}

async function setup() {
  //setup blockchain
  console.log("START BLOCKCHAIN SETUP");
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

  console.log("SUCCESS BLOCKCHAIN SETUP");

  console.log("START ROS SETUP");

  //ROS setup
  let ros = new ROSLIB.Ros({ url: "ws://localhost:9090" });

  ros.on("connection", function () {
    console.log("successfully connected!");
    // pulish();
  });

  ros.on("error", (error) => {
    console.error(error);
  });

  ros.on("close", () => {
    console.log("connection closed");
  });

  let taskAssign = new ROSLIB.Topic({
    ros: ros,
    name: "/taskAssign",
    messageType: "std_msgs/String",
  });

  console.log("SUCCESS BLOCKCHAIN SETUP");

  return {
    ros,
    taskAssign,
    taskManager,
  };
}
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const { ros, taskAssign, taskManager } = await setup();

  while (true) {
    //get task
    let taskValue = null;
    try {
      taskValue = await taskManager.getOwnTask();
      console.log("get task result", taskValue);
    } catch (error) {
      console.error(error);
      console.log(error.message);
      const code = +error.message.split(":")[1];
      console.log("check code", code);
      if (code == 0) {
        await delay(2000);
      } else {
        return;
      }
    }

    //start job
    if (taskValue == null) {
      continue;
    }

    // taskAssign.publish()
  }
}

main().then(() => {
  console.log("End");
});

// let listener = new ROSLIB.Topic({
//     ros: ros,
//     name: '/taskReport',
//     messageType: 'std_msgs/Int16'
// })

// listener.subscribe((message) => {
//     console.log('Received message on ' + listener.name + ': ' + message);
// })
// }
// let message = new ROSLIB.Message({data: 'AtoB'});

// taskAssign.publish(message);
// console.log('done publish!');
