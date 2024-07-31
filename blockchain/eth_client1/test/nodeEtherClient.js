const ROSLIB = require("roslib");
// const { ethers } = require("hardhat");

// async function getTask() {
//   const value = await taskAssigner.getOwnTask();
//   console.log("get task result", value);
//   // let message = new ROSLIB.Message({data: 'AtoB'});
//   // taskAssign.publish(message);
// }

//setup blockchain
// const contractAddress = "0xb4B46bdAA835F8E4b4d8e208B6559cD267851051"; // Replace with your deployed contract address
// const TaskAssigner = await ethers.getContractFactory("TaskAssigner");
// const taskAssigner = await TaskAssigner.attach(contractAddress);

// taskAssigner.on("DoneFindingFreeBots", (freeBotsID) => {
//   console.log("Free Bots IDs:", freeBotsID);
// });

// // Listen for DoneFindingNewTasks event
// taskAssigner.on("DoneFindingNewTasks", (unassignedTasksID) => {
//   console.log("Unassigned Tasks IDs:", unassignedTasksID);
// });

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

let message = new ROSLIB.Message({ data: "AtoB" });

let listener = new ROSLIB.Topic({
  ros: ros,
  name: "/taskReport",
  messageType: "std_msgs/Int16",
});

listener.subscribe((message) => {
  console.log("Received message on " + listener.name + ": " + message);
});

taskAssign.publish(message);
console.log("done publish!");
