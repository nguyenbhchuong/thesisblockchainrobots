"use client";

import { useContext, useEffect, useState } from "react";
import styles from "./detailSidebarQuery.module.css";
import globalStyles from "@/styles/global.module.css";
import { getContract } from "@/contracts/contracts";

export default function DetailSidebarQuery() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [good, setGood] = useState<string>("");

  const addTask = async () => {
    const contract = await getContract();
    contract.addTask(good, from, to, Math.round(Date.now() / 1000));
  };

  const clearForm = () => {
    setFrom("");
    setTo("");
    setGood("");
  };
  return (
    <div className={styles.sidebar}>
      <p className={globalStyles.titleText}>Add Tasks</p>
      <div className={styles.inputRow}>
        <p>From</p>
        <input
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>
      <div className={styles.inputRow}>
        <p>To</p>
        <input type="text" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className={styles.inputRow}>
        <p>Good</p>
        <input
          type="text"
          value={good}
          onChange={(e) => setGood(e.target.value)}
        />
      </div>

      <div style={{ flex: 1 }}></div>
      <div className={styles.bottomZone}>
        <div className={styles.button} onClick={() => clearForm()}>
          Clear
        </div>
        <div
          className={styles.button}
          style={{ background: "#9DEE81" }}
          onClick={() => addTask()}
        >
          Add
        </div>
      </div>
    </div>
  );
}
