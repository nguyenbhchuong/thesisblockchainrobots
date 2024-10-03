"use client";

import Image from "next/image";
import styles from "./page.module.css";
import acalendarLogo from "@/public/acalendar-logo.svg";
import globalStyles from "@/styles/global.module.css";

export default function Home() {
  return (
    <div className={styles.home}>
      <Image
        src={acalendarLogo}
        height={80}
        width={80}
        alt="Acalendar by Omega"
      />
      <p className={globalStyles.titleText}>Academic Calendar</p>
      <p>Use the top bar to navigate to functions!</p>
    </div>
  );
}
