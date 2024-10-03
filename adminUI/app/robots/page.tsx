"use client";

import { useContext, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import ImportContext, { importContext } from "@/context/Import/ImportContext";
import { globalContext } from "@/context/Global/GlobalContext";
import ControlBar from "@/components/controlBar/ControlBar";
import { IRobot } from "@/type/dataType";
import { getContract } from "@/contracts/contracts";

export default function Robots() {
  const { data, setData } = useContext(globalContext);
  const { importObjects, setImportObjects } = useContext(importContext);
  //const [data, setData] = useState<IData>({ root: {} });
  const statusList = ["All", "Unassigned", "Assigned", "Received", "Error"];

  const [robots, setRobots] = useState<IRobot[]>([]);

  useEffect(() => {
    async function fetchData() {
      const contract = await getContract();
      const robots = await contract.readRobots();
      const parsedRobots = parseRobot(robots);
      setRobots(parsedRobots);
      console.log(parsedRobots);
    }

    fetchData();
  }, []);

  const parseRobot = (robots: any[]): IRobot[] => {
    const parsedRobots: IRobot[] = [];
    robots.map((robot, i) => {
      const newRobot: IRobot = {
        id: i,
        address: robot.node_address,
        status: parseInt(robot.status._hex, 16),
        credit: parseInt(robot.credit._hex, 16),
      };

      parsedRobots.push(newRobot);
    });
    return parsedRobots;
  };

  return (
    <div className={styles.body}>
      <ControlBar title="Robots" statusList={statusList} />
      {/* table*/}
      <div className={styles.table}>
        <div className={styles.tableRow}>
          <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
            ID
          </div>
          <div className={styles.tableColumn}>Address</div>
          <div className={styles.tableColumn}>Status</div>
          <div className={styles.tableColumn}>Credit</div>
        </div>
        <div
          style={{
            borderBottom: "1px solid #d5d5d5",
            width: "100%",
            height: "1px",
          }}
        />
        {robots.map((e, i) => {
          return <RobotRow key={i} robot={e} />;
        })}
      </div>
    </div>
  );
}

function RobotRow(props: { robot: IRobot }) {
  const { robot } = props;
  return (
    <div className={styles.tableRow}>
      <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
        {robot.id}
      </div>
      <div className={styles.tableColumn}>{robot.address}</div>
      <div className={styles.tableColumn}>{robot.status}</div>
      <div className={styles.tableColumn}>{robot.credit}</div>
    </div>
  );
}
