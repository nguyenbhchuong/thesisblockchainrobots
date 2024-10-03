import React, { ChangeEventHandler, useEffect, useState } from "react";
import styles from "./ControlBar.module.css";
import globalStyles from "@/styles/global.module.css";

interface IControlBar {
  title: string;
  statusList: string[];
}

export default function ControlBar(props: IControlBar) {
  const { title, statusList } = props;

  const [currentStatus, setCurrentStatus] = useState(0);

  return (
    <div className={styles.controlBar}>
      {/* title */}
      <div className={globalStyles.titleText}>{title}</div>
      {/* control island */}
      <ControlIsland
        statusList={statusList}
        currentStatus={currentStatus}
        setCurrentStatus={setCurrentStatus}
      />
    </div>
  );
}

interface IControlIsland {
  statusList: string[];
  currentStatus: number;
  setCurrentStatus: any;
}

function ControlIsland(props: IControlIsland) {
  const { statusList, currentStatus } = props;
  return (
    <div className={styles.controlIsland}>
      {statusList.map((e, i) => {
        return <div>{e}</div>;
      })}
    </div>
  );
}
