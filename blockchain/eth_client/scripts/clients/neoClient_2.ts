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

interface IReport {
  stage: number;
  taskId: number;
}

const nodeNumber = 2;

let reportBuffer: IReport[] = [];
let stageNumber: number = 0;
let taskValue: any = null;

// let timeOutClock = 0;
// let isCountingDown = false;
// const timeoutLimit = 30;

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
  let ros = new ROSLIB.Ros({ url: "ws://localhost:9092" });

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
    name: `/taskAssign`,
    messageType: "std_msgs/String",
  });
  let taskReport = new ROSLIB.Topic({
    ros: ros,
    name: `/taskReport`,
    messageType: "std_msgs/String",
  });

  // taskReport.subscribe((message: any) => {
  //   console.log("Received message on " + taskReport.name + ": ");
  //   console.log(message.data);
  //   const data = message.data.split(";");

  //   if (!taskValue) {
  //     console.log("no current task to receive report!");
  //     return;
  //   }
  //   if (Number(data[1]) != Number(taskValue[0])) {
  //     console.log("report not for the current task");
  //     return;
  //   }

  //   if (Number(data[0]) >= 0) {
  //     stageNumber = Number(data[0]) + 1;
  //   } else {
  //     stageNumber = Number(data[0]);
  //   }
  // });

  taskReport.subscribe((message: any) => {
    console.log("Received message on " + taskReport.name + ": ");
    console.log(message.data);
    const data = message.data.split(";");

    let newReport: IReport = {
      stage: Number(data[0]),
      taskId: Number(data[1]),
    };
    reportBuffer.push(newReport);
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
    try {
      //read report buffer
      if (reportBuffer.length > 0) {
        let currentReport = reportBuffer.shift();

        if (!currentReport) {
          throw "shift error!";
        }

        if (!taskValue) {
          console.log("no current task to receive report!");
          continue;
        }
        if (currentReport.taskId != Number(taskValue[0])) {
          console.log("report not for the current task");
          continue;
        }

        if (currentReport.stage >= 0) {
          stageNumber = currentReport.stage + 1;
        } else {
          //error code
          stageNumber = currentReport.stage;
        }
      }

      //getting task and spam the navigator
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
          }
        }

        //start job
        if (taskValue == null) {
          continue;
        }
        const timeStamp = Date.now();
        const goodPosition = await getDocument(taskValue[2]);

        console.log(
          "message: ",
          `${timeStamp};${goodPosition.x};${goodPosition.y}`
        );
        let message = new ROSLIB.Message({
          data: `${timeStamp};${goodPosition.x};${goodPosition.y};${stageNumber};${taskValue[0]}`,
        });
        taskAssign.publish(message);
        console.log("done start publish!");
        // //test
        // let messageTest = new ROSLIB.Message({
        //   data: `${-1}`,
        // });
        // await delay(1000);
        // taskAssign.publish(messageTest);
        // //test
      }

      //receive navigator's confirmation
      if (stageNumber == 1) {
        try {
          let tx = await taskManagerRunner.updateTaskStatus(
            Number(taskValue[0]),
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

      //reach the pick up location, send out navigation
      if (stageNumber == 2) {
        try {
          const timeStamp = Date.now();
          const deliveryPosition = await getDocument(taskValue[3]);

          const goodPosition = await getDocument(taskValue[2]);

          await checkAndTakeGood(taskValue[2], taskValue[1]); //goodPosition and goodID

          let tx = await taskManagerRunner.updateTaskStatus(
            Number(taskValue[0]),
            3,
            Math.round(Date.now() / 1000)
          );
          await tx.wait();

          try {
            let txValidate = await taskManagerRunner.reportGoods(
              goodPosition.good,
              taskValue[2]
            );
            await txValidate.wait();
          } catch (error) {
            console.log(
              "reporting good is not running, the system still continue",
              error
            );
          }

          let message = new ROSLIB.Message({
            data: `${timeStamp};${deliveryPosition.x};${deliveryPosition.y};${stageNumber};${taskValue[0]}`,
          });
          taskAssign.publish(message);
          console.log("done delivery publish!");

          console.log("Receiving Good was successful");
          stageNumber = -1;
        } catch (error) {
          console.log("Receiving Good failed:", error);
          let tx = await taskManagerRunner.updateTaskStatus(
            taskValue[0],
            403,
            Math.round(Date.now() / 1000)
          );

          await tx.wait();
          stageNumber = 0;
        }
      }

      //recevie navigator's confirmation
      if (stageNumber == 3) {
        console.log("recieved delivery goal");
      }

      //done delivery
      if (stageNumber == 4) {
        try {
          const deliverPosition = await getDocument(taskValue[3]);

          await checkAndGiveGood(taskValue[3], taskValue[1]);

          let tx = await taskManagerRunner.updateTaskStatus(
            taskValue[0],
            5,
            Math.round(Date.now() / 1000)
          );
          await tx.wait();

          try {
            let txValidate = await taskManagerRunner.reportGoods(
              deliverPosition.good,
              taskValue[3]
            );
            await txValidate.wait();
          } catch (error) {
            console.log(
              "reporting good is not running, the system still continue",
              error
            );
          }

          console.log("Transaction was successful");
          stageNumber = 0;

          const timeStamp = Date.now();

          const deliveryPosition = await getDocument(taskValue[3]);
          let message = new ROSLIB.Message({
            data: `${timeStamp};${deliveryPosition.x - 0.5};${
              deliveryPosition.y - 0.5
            };${100};${-1}`,
          }); // get away from the delivery spot
          taskAssign.publish(message);
          console.log("done delivery publish!");
        } catch (error) {
          console.log("Delivery failed:", error);
          let tx = await taskManagerRunner.updateTaskStatus(
            taskValue[0],
            403,
            Math.round(Date.now() / 1000)
          );
          await tx.wait();
          stageNumber = 0;
        }
      }

      //navigator error
      if (stageNumber == -2) {
        console.log("Task Error in Navigator");
        let tx = await taskManagerRunner.updateTaskStatus(
          Number(taskValue[0]),
          402,
          Math.round(Date.now() / 1000)
        );
        await tx.wait();
        stageNumber = 0;
      }

      //timeout error
      if (stageNumber == -3) {
        let tx = await taskManagerRunner.updateTaskStatus(
          Number(taskValue[0]),
          405,
          Math.round(Date.now() / 1000)
        );
        await tx.wait();
        stageNumber = 0;
      }

      //done hiding
      if (stageNumber > 100) {
        stageNumber = 0;
      }

      //client error and interrupt navigator
    } catch (error) {
      console.log("global error:", error);
      let message = new ROSLIB.Message({
        data: `${-1}`,
      });
      console.log("published error!");

      taskAssign.publish(message);
      console.log("client error!");
      try {
        let tx = await taskManagerRunner.updateTaskStatus(
          Number(taskValue[0]),
          400,
          Math.round(Date.now() / 1000)
        );
        await tx.wait();
      } catch (error) {
        console.log("The error occured not related to any task!");
      }

      stageNumber = 0;
    }

    await delay(1000);
  }
}

main().then(() => {
  console.log("End Node");
});
