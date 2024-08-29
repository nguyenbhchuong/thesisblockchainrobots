import {
  BaseContract,
  Contract,
  ContractFactory,
  ContractRunner,
  Signer,
  Transaction,
} from "ethers";

// const ROSLIB = require("roslib");
import ROSLIB from "roslib";
const { ethers } = require("hardhat");
const { doc, getDoc, updateDoc } = require("firebase/firestore");
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { contractAddress } = require("../contractAddress");

// const contractAddress = "0x422A3492e218383753D8006C7Bfa97815B44373F"; // Replace with your deployed contract address
const nodeNumber = 2;

let stageNumber: number = 0;
let taskValue: any = null;

// setup firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9qKXOVt5Nyc_hZ5hAqBBHf6EuStFm2Bc",
  authDomain: "location-service-6d88a.firebaseapp.com",
  projectId: "location-service-6d88a",
  storageBucket: "location-service-6d88a.appspot.com",
  messagingSenderId: "126038330312",
  appId: "1:126038330312:web:a0895b39c0fab0cda2cefd",
  measurementId: "G-Y4X5Y6WTPE",
};
console.log("START FIREBASE SETUP");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const blockchainNodeSetup = async () => {
  console.log("DONE BLOCKCHAIN SETUP");

  //setup blockchain
  console.log("START BLOCKCHAIN SETUP");
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

  console.log("DONE BLOCKCHAIN SETUP");

  console.log("START ROS SETUP");

  //ROS setup
  let ros = new ROSLIB.Ros({ url: "ws://localhost:9090" });

  ros.on("connection", function () {
    console.log("successfully connected!");
    // pulish();
  });

  ros.on("error", (error: any) => {
    console.error(error);
  });

  ros.on("close", () => {
    console.log("connection closed");
  });

  let taskAssign = new ROSLIB.Topic({
    ros: ros,
    name: `/taskAssign_${nodeNumber}`,
    messageType: "std_msgs/String",
  });
  let taskReport = new ROSLIB.Topic({
    ros: ros,
    name: `/taskReport_${nodeNumber}`,
    messageType: "std_msgs/Int16",
  });

  taskReport.subscribe((message: any) => {
    console.log("Received message on " + taskReport.name + ": ");
    console.log(message.data);
    const data = message.data;

    stageNumber = data;
  });

  console.log("DONE ROS SETUP");

  return {
    ros,
    taskAssign,
    // taskReport,
    taskManager,
    taskManagerRunner,
  };
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getDocument = async (locationName: string) => {
  const docRef = doc(db, "location", locationName);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    return docSnap.data();
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }
};

const checkAndTakeGood = async (locationName: string, goodID: string) => {
  const goodList = (await getDocument(locationName)).good;
  if (goodList.includes(goodID)) {
    const docRef = doc(db, "location", locationName);
    const index = goodList.indexOf(goodID);
    if (index > -1) {
      goodList.splice(index, 1);
    } else {
      throw "no good to take";
    }
    await updateDoc(docRef, {
      good: goodList,
    });
  }
};

const checkAndGiveGood = async (locationName: string, goodID: string) => {
  const goodList = (await getDocument(locationName)).good;
  const docRef = doc(db, "location", locationName);
  goodList.push(goodID);
  await updateDoc(docRef, {
    good: goodList,
  });
};

async function main() {
  const { ros, taskAssign, taskManager, taskManagerRunner } =
    await blockchainNodeSetup();

  while (true) {
    if (stageNumber == 0) {
      //get task

      taskValue = null;
      try {
        taskValue = await taskManagerRunner.getOwnTask();
        console.log("get task result", taskValue);
      } catch (error: any) {
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
      const timeStamp = Date.now();
      const goodPosition = await getDocument(taskValue[2]);
      const deliveryPosition = await getDocument(taskValue[3]);
      console.log(
        "message: ",
        `${timeStamp};${goodPosition.x};${goodPosition.y};${deliveryPosition.x};${deliveryPosition.y}`
      );
      let message = new ROSLIB.Message({
        data: `${timeStamp};${goodPosition.x};${goodPosition.y};${deliveryPosition.x};${deliveryPosition.y}`,
      });
      taskAssign.publish(message);
      console.log("done publish!");
    }

    if (stageNumber == 1) {
      try {
        let tx = await taskManagerRunner.updateTaskStatus(
          taskValue[0],
          2,
          Math.round(Date.now() / 1000)
        );
        await tx.wait();
        console.log("Receiving Task was successful");
        stageNumber = -1;
      } catch (error) {
        console.log("Transaction failed:", error);
        stageNumber = 0;
      }
    }

    if (stageNumber == 2) {
      try {
        const goodPosition = await getDocument(taskValue[2]);

        await checkAndTakeGood(taskValue[2], taskValue[1]); //goodPosition and goodID

        let tx = await taskManagerRunner.updateTaskStatus(
          taskValue[0],
          3,
          Math.round(Date.now() / 1000)
        );
        await tx.wait();

        let txValidate = await taskManagerRunner.reportGoods(
          goodPosition.good,
          taskValue[2]
        );
        await txValidate.wait();

        console.log("Receiving Good was successful");
        stageNumber = -1;
      } catch (error) {
        console.log("Receiving Good failed:", error);
        let tx = await taskManagerRunner.updateTaskStatus(
          taskValue[0],
          4,
          Math.round(Date.now() / 1000)
        );
        stageNumber = 0;
      }
    }

    if (stageNumber == 3) {
      try {
        const deliverPosition = await getDocument(taskValue[3]);

        await checkAndGiveGood(taskValue[3], taskValue[1]);

        let tx = await taskManagerRunner.updateTaskStatus(
          taskValue[0],
          5,
          Math.round(Date.now() / 1000)
        );
        await tx.wait();

        let txValidate = await taskManagerRunner.reportGoods(
          deliverPosition.good,
          taskValue[3]
        );
        await txValidate.wait();

        console.log("Transaction was successful");
        stageNumber = 0;
      } catch (error) {
        console.log("Transaction failed:", error);
        let tx = await taskManagerRunner.updateTaskStatus(
          taskValue[0],
          4,
          Math.round(Date.now() / 1000)
        );
        stageNumber = 0;
      }
    }

    await delay(1000);
  }
}

main().then(() => {
  console.log("End Node");
});
