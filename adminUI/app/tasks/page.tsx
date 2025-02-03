"use client";

import { useContext, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import ImportContext, { importContext } from "@/context/Import/ImportContext";
import { globalContext } from "@/context/Global/GlobalContext";
import ControlBar from "@/components/controlBar/ControlBar";
import { getContract } from "@/contracts/contracts";
import { ITask } from "@/type/dataType";

const taskStatus = [
  "Unassigned",
  "Assigned",
  "Started",
  "PickedUp",
  "Error",
  "Delivered",
  "Validated",
  "Report",
];

export default function Tasks() {
  const { data, setData } = useContext(globalContext);
  const { importObjects, setImportObjects } = useContext(importContext);
  //const [data, setData] = useState<IData>({ root: {} });
  const statusList = ["All", "Unassigned", "Assigned", "Received", "Error"];

  const [tasks, setTasks] = useState<ITask[]>([]);

  useEffect(() => {
    async function fetchData() {
      const contract = await getContract();
      const tasks = await contract.readTasks();
      const parsedTasks = parseTask(tasks);
      setTasks(parsedTasks);
      console.log(parsedTasks);
    }

    fetchData();
  }, []);

  const parseTask = (tasks: any[]): ITask[] => {
    const parsedTasks: ITask[] = [];
    console.log("check tasks", tasks);
    tasks.map((task) => {
      const newTask: ITask = {
        origin: task.origin,
        destination: task.destination,
        good: task.good,
        id: parseInt(task.id._hex, 16),
        assigner: parseInt(task.assigner._hex, 16),
        validator: parseInt(task.validator._hex, 16),
        stage: parseInt(task.stage._hex, 16),
        timeIssued: parseInt(task.timeIssued._hex, 16),
        timeStarted: parseInt(task.timeStarted._hex, 16),
        timeDelivered: parseInt(task.timeDelivered._hex, 16),
      };

      parsedTasks.push(newTask);
    });
    return parsedTasks;
  };

  return (
    <div className={styles.body}>
      <ControlBar title="Tasks" statusList={statusList} />
      {/* table*/}
      <div className={styles.table}>
        <div className={styles.tableRow}>
          <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
            ID
          </div>
          <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
            From
          </div>
          <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
            To
          </div>
          <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
            GoodId
          </div>
          <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
            RobotID
          </div>
          <div className={styles.tableColumn}>Time Issued</div>
          <div className={styles.tableColumn}>Time Started</div>
          <div className={styles.tableColumn}>Time Delivered</div>
          <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
            Status
          </div>
        </div>
        <div
          style={{
            borderBottom: "1px solid #d5d5d5",
            width: "100%",
            height: "1px",
          }}
        />
        {tasks.map((e, i) => {
          return <TaskRow key={i} task={e} />;
        })}
      </div>
    </div>
  );
}

function TaskRow(props: { task: ITask }) {
  const task = props.task;
  return (
    <div className={styles.tableRow}>
      <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
        {task.id}
      </div>
      <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
        {task.origin}
      </div>
      <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
        {task.destination}
      </div>
      <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
        {task.good}
      </div>
      <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
        {task.stage < 1 ? "null" : task.assigner}
      </div>
      <div className={styles.tableColumn}>
        {new Date(task.timeIssued * 1000).toLocaleString()}
      </div>
      <div className={styles.tableColumn}>
        {task.timeStarted > 0
          ? new Date(task.timeStarted * 1000).toLocaleString()
          : "null"}
      </div>
      <div className={styles.tableColumn}>
        {task.timeDelivered > 0
          ? new Date(task.timeDelivered * 1000).toLocaleString()
          : "null"}
      </div>
      <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
        {taskStatus[task.stage] ?? task.stage}
      </div>
    </div>
  );
}
