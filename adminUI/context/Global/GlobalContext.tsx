"use client";

import app from "@/services/firebase";
import resolveDataKeys, { IKeyStore } from "@/services/processDataKeys";
import { IData, IDayCalendar, typeFaculty } from "@/type/dataType";
import { getDatabase, onValue, ref } from "firebase/database";
import { createContext, useEffect, useState } from "react";

export interface IGlobalContext {
  data: IData;
  setData: any;
  dataKey: { keysByFaculty: IKeyStore; keysByIntake: IKeyStore };
  chosenCellSlot: number;
  setChosenCellSlot: any;
  queryValue: string[];
  setQueryValue: any;
}

export const globalContext = createContext<IGlobalContext>({
  data: { root: {} },
  setData: undefined,
  dataKey: { keysByFaculty: {}, keysByIntake: {} },
  chosenCellSlot: -1,
  setChosenCellSlot: undefined,
  queryValue: [],
  setQueryValue: undefined,
});

export default function GlobalContext(props: any) {
  const [data, setData] = useState<IData>({
    root: {},
  });
  const [dataKey, setDataKeys] = useState<{
    keysByFaculty: IKeyStore;
    keysByIntake: IKeyStore;
  }>({ keysByFaculty: {}, keysByIntake: {} });
  const [chosenCellSlot, setChosenCellSlot] = useState(-1);
  const [queryValue, setQueryValue] = useState<string[]>([]);

  const object = {
    data,
    setData,
    dataKey,
    chosenCellSlot,
    setChosenCellSlot,
    queryValue,
    setQueryValue,
  };

  useEffect(() => {
    const db = getDatabase(app);
    const dataRef = ref(db, "/");
    onValue(dataRef, (snapshot) => {
      const tempData = snapshot.val();
      setData(tempData);
      setDataKeys(resolveDataKeys(Object.keys(tempData.root)));
    });
  }, []);

  return (
    <globalContext.Provider value={object}>
      {props.children}
    </globalContext.Provider>
  );
}
