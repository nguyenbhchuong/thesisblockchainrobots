"use client";

import { useContext, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import ImportContext, { importContext } from "@/context/Import/ImportContext";
import { globalContext } from "@/context/Global/GlobalContext";
import ControlBar from "@/components/controlBar/ControlBar";
import { ILocation, IRobot } from "@/type/dataType";
import { getContract } from "@/contracts/contracts";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import app from "@/services/firebase";

export default function Robots() {
  // const { data, setData } = useContext(globalContext);
  // const { importObjects, setImportObjects } = useContext(importContext);
  //const [data, setData] = useState<IData>({ root: {} });
  const statusList = ["All", "Unassigned", "Assigned", "Received", "Error"];

  const [locations, setLocations] = useState<ILocation[]>([]);

  useEffect(() => {
    async function fetchData() {
      const db = getFirestore(app);
      const q = query(collection(db, "location"));
      const querySnapshot = await getDocs(q);

      const newLocations: ILocation[] = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const data = doc.data();

        const newLocation: ILocation = {
          id: doc.id,
          x: data.x,
          y: data.y,
          goods: data.good,
        };
        newLocations.push(newLocation);
      });

      console.log(newLocations);

      setLocations(newLocations);
    }

    fetchData();
  }, []);

  // const parseRobot = (robots: any[]): IRobot[] => {
  //   const parsedRobots: IRobot[] = [];
  //   robots.map((robot, i) => {
  //     const newRobot: IRobot = {
  //       id: i,
  //       address: robot.node_address,
  //       status: parseInt(robot.status._hex, 16),
  //       credit: parseInt(robot.credit._hex, 16),
  //     };

  //     parsedRobots.push(newRobot);
  //   });
  //   return parsedRobots;
  // };

  return (
    <div className={styles.body}>
      <ControlBar title="Robots" statusList={statusList} />
      {/* table*/}
      <div className={styles.table}>
        <div className={styles.tableRow}>
          <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
            ID
          </div>
          <div className={styles.tableColumn}>X</div>
          <div className={styles.tableColumn}>Y</div>
          <div className={styles.tableColumn}>Goods</div>
        </div>
        <div
          style={{
            borderBottom: "1px solid #d5d5d5",
            width: "100%",
            height: "1px",
          }}
        />
        {locations.map((e, i) => {
          return <LocationRow key={i} location={e} />;
        })}
      </div>
    </div>
  );
}

function LocationRow(props: { location: ILocation }) {
  const { location } = props;
  console.log(location);
  return (
    <div className={styles.tableRow}>
      <div className={[styles.tableColumn, styles.smallColumn].join(" ")}>
        {location.id}
      </div>
      <div className={styles.tableColumn}>{location.x}</div>
      <div className={styles.tableColumn}>{location.y}</div>
      <div className={styles.tableColumn}>
        {location.goods?.map((e, i) => {
          return <p>{e},</p>;
        })}
      </div>
    </div>
  );
}
