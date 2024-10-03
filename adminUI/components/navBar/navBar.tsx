"use client";

import { useRouter } from "next/navigation";
import styles from "./navbar.module.css";

export default function NavBar() {
  const router = useRouter();

  return (
    <div className={styles.navbar}>
      <div className={styles.nav_button} onClick={() => router.push("/tasks")}>
        <p>Tasks</p>
      </div>
      <div className={styles.nav_button} onClick={() => router.push("/robots")}>
        <p>Robots</p>
      </div>
      <div
        className={styles.nav_button}
        onClick={() => router.push("/locations")}
      >
        <p>Locations</p>
      </div>
    </div>
  );
}
