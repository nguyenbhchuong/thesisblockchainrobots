import importExcel, { file_to_wb } from "@/services/importExcel";
import { IData, IFaculty } from "@/type/dataType";
import { useContext, useEffect, useState } from "react";
import { WorkBook } from "xlsx";
import styles from "./ImportRow.module.css";
import { IImportObject, importContext } from "@/context/Import/ImportContext";

interface ImportRowsProps {
  id: number;
}

export default function ImportRow(props: ImportRowsProps) {
  const { id } = props;
  const { importObjects, setImportObjects } = useContext(importContext);
  const [file, setFile] = useState<File | undefined>(undefined);

  const [rowsNum, setRowsNum] = useState<number>(1);
  const [facultyName, setFacultyName] = useState<string>("");

  //count number of sheets
  async function checkDataSheet(file: File): Promise<number> {
    const wb: WorkBook = await file_to_wb(file);
    const rowsNum = wb.SheetNames.length;
    return rowsNum;
  }

  //process file on choose
  useEffect(() => {
    async function processRowsNum() {
      //count sheets
      const rowsNum = file ? await checkDataSheet(file) : 1;
      //count row
      setRowsNum(rowsNum);
    }
    processRowsNum();
  }, [file]);

  //on file or name change
  useEffect(() => {
    async function processRowsNum() {
      //set import object

      const newImportObject = {
        ...importObjects,
        [id]: { facultyYear: facultyName, file },
      };
      setImportObjects(newImportObject);
    }
    processRowsNum();
  }, [file, facultyName]);

  return (
    <div className={styles.tableRow}>
      <div className={[styles.tableColumn, styles.tableColumnStart].join(" ")}>
        <input
          type="text"
          placeholder="Input with form CSE2020"
          value={facultyName}
          onChange={(e) => setFacultyName(e.target.value)}
        />
      </div>
      <div className={styles.tableColumn}>
        <input
          type="file"
          onChange={async (e) => {
            setFile(e.target.files?.[0]);
            setRowsNum(rowsNum);
          }}
        />
      </div>
      <div className={styles.tableColumn} style={{ width: "40%" }}>
        <p>{rowsNum}</p>
      </div>
    </div>
  );
}
