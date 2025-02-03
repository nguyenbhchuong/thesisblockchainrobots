"use client";

import { useContext, useEffect, useState } from "react";
import Dropdown, { IItemValue } from "../dropDownButton/Dropdown";
import { globalContext } from "@/context/Global/GlobalContext";
import styles from "./queryTab.module.css";

interface IQueryTabProps {
  queryValue: string[]; //'CSE2020' 'BCE2020'
  onChange: (value: string[]) => void;
  isOpened: boolean;
}
export default function QueryTab(props: IQueryTabProps) {
  const { queryValue, onChange, isOpened } = props;

  const [queryArray, setQuerryArray] = useState<{ [key: number]: string[] }>(
    {}
  );
  const [queryRowIndex, setQueryRowIndex] = useState<number[]>([0]); //queryRows indexes

  //turn data from Object of arrays to string array
  const resolveQueryArray = () => {
    queryValue.splice(0, queryValue.length);
    Object.values(queryArray).forEach((value: string[]) => {
      value.forEach((keyOfData: string) => {
        if (!queryValue.includes(keyOfData)) queryValue.push(keyOfData);
      });
    });
  };

  //return Data to outside
  useEffect(() => {
    resolveQueryArray();
    onChange(queryValue);
  }, [queryArray]);

  return (
    <div
      className={styles.queryTab}
      style={{ display: isOpened ? "flex" : "none" }}
    >
      {queryRowIndex.map((value: number, index: number) => {
        return (
          <QueryRow
            key={value}
            index={value}
            queryRowIndex={queryRowIndex}
            setQueryRowIndex={setQueryRowIndex}
            queryArray={queryArray}
            setQueryArray={setQuerryArray}
          />
        );
      })}
    </div>
  );
}

interface IQueryRowProps {
  index: number;
  queryArray: { [key: number]: string[] };
  queryRowIndex: number[];
  setQueryRowIndex: any;
  setQueryArray: any;
}
function QueryRow(props: IQueryRowProps) {
  //take from outside
  const { index, queryArray, setQueryArray, queryRowIndex, setQueryRowIndex } =
    props;
  const { dataKey } = useContext(globalContext);

  //local process
  const [faculty, setFaculty] = useState<IItemValue>({ id: -1, name: "" });
  const [intake, setIntake] = useState<IItemValue>({ id: -1, name: "" });
  const [addOrRemove, setAddOrRemove] = useState<boolean>(false);

  const defaultFacultyList = Object.keys(dataKey.keysByFaculty);
  const defaultIntakeList = Object.keys(dataKey.keysByIntake);

  //reset when the other field changed fix bug
  useEffect(() => {
    const currentIntakeList = calculateIntakeList();

    //not yet chosen
    if (intake.id === -1) return;
    //chosen - name stay
    if (intake.name === currentIntakeList[intake.id]) return;
    //chonsen - name changed - not found in new list
    if (!currentIntakeList.includes(intake.name)) {
      setIntake({ id: -1, name: "" });
    } else {
      const keyId = currentIntakeList.indexOf(intake.name);
      console.log("===========get in=================");
      console.log(intake, keyId);
      console.log("====================================");
      setIntake({ ...intake, id: keyId });
    }
  }, [faculty]);

  useEffect(() => {
    const currentFacultyList = calculateFacultyList();
    //not yet chosen
    if (faculty.id === -1) return;
    //chosen - name stay
    if (faculty.name === currentFacultyList[faculty.id]) return;
    //chonsen - name changed - not found in new list
    if (!currentFacultyList.includes(faculty.name)) {
      setFaculty({ id: -1, name: "" });
    } else {
      const keyId = currentFacultyList.indexOf(faculty.name);
      setFaculty({ ...faculty, id: keyId });
    }
  }, [intake]);

  //take faculty, return corresponding intakes
  const calculateFacultyList = (): string[] => {
    if (intake.id === -1 || intake.name === "All")
      return [...defaultFacultyList, "All"];
    return [...dataKey.keysByIntake[intake.name], "All"];
  };
  //take faculty, return corresponding intakes
  const calculateIntakeList = (): string[] => {
    if (faculty.id === -1 || faculty.name === "All")
      return [...defaultIntakeList, "All"];
    if (faculty.name.substring(0, 5) === "Note:") return [];
    return [...dataKey.keysByFaculty[faculty.name], "All"];
  };

  //concat 2 fields to make the results
  const returnResults = (): string[] => {
    let results: string[] = [];

    if (
      faculty.id === -1 ||
      (intake.id === -1 && faculty.name.substring(0, 5) !== "Note:")
    )
      return [];

    if (faculty.name === "All" && intake.name === "All") {
      defaultFacultyList.forEach((facVal: string) => {
        dataKey.keysByFaculty[facVal].forEach((intVal: string) => {
          results.push(facVal + intVal);
        });
      });
    } else if (faculty.name === "All") {
      dataKey.keysByIntake[intake.name].forEach((facVal: string) => {
        results.push(facVal + intake.name);
      });
    } else if (intake.name === "All") {
      dataKey.keysByFaculty[faculty.name].forEach((intVal: string) => {
        results.push(faculty.name + intVal);
      });
    } else {
      results.push(faculty.name + intake.name);
    }

    return results;
  };

  useEffect(() => {
    if (addOrRemove) {
      setQueryArray({ ...queryArray, [index]: returnResults() });
    }
  }, [intake, faculty, addOrRemove]);

  const cutNoteFromDisplay = (text: string) => {
    if (text.substring(0, 5) === "Note:") return text.substring(5);
    return text;
  };

  return (
    <div className={styles.queryRow}>
      <Dropdown
        placeHolder={"faculty"}
        itemList={calculateFacultyList()}
        value={faculty}
        onChange={(value: IItemValue) => {
          setFaculty(value);
        }}
        modifyDisplay={cutNoteFromDisplay}
      />
      <Dropdown
        placeHolder={"intake"}
        itemList={calculateIntakeList()}
        value={intake}
        onChange={(value: IItemValue) => {
          setIntake(value);
        }}
      />
      <div style={{ flex: 1 }} />
      <button
        className={styles.button}
        onClick={() => {
          if (addOrRemove === false) {
            setQueryRowIndex([...queryRowIndex, index + 1]);
            setAddOrRemove(true);
          } else {
            //remove row
            let id = queryRowIndex.indexOf(index);
            //remove UI
            if (id !== -1) {
              queryRowIndex.splice(id, 1);
              setQueryRowIndex([...queryRowIndex]);
            }
            //remove data
            if (index in queryArray) {
              delete queryArray[index];
            }

            //set the delete because when delete this component, the useEffect doesnot work
            setQueryArray({ ...queryArray });
          }
        }}
      >
        {addOrRemove ? "-" : "+"}
      </button>
    </div>
  );
}
