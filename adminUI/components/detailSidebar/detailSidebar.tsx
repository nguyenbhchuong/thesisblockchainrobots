"use client";

import { useContext, useEffect, useState } from "react";
import styles from "./detailSidebar.module.css";
import globalStyles from "@/styles/global.module.css";
import { globalContext } from "@/context/Global/GlobalContext";
import { IData } from "@/type/dataType";
import writeDataServer from "@/services/firebaseWrite";
import { usePathname } from "next/navigation";
import Dropdown from "../dropDownButton/Dropdown";
import DetailSidebarQuery from "./detailSidebarQuery/detailSidebarQuery";

export default function DetailSidebar() {
  const pathName = usePathname();

  return <DetailSidebarQuery />;
}
