import {
  ICalendar,
  IData,
  IFaculty,
  daysOfWeek,
  typeDaysOfWeek,
} from "@/type/dataType";

import { WorkBook, read, utils } from "xlsx";

export async function file_to_wb(file: File): Promise<WorkBook> {
  return read(await file?.arrayBuffer());
}

function processToICalendar(tempData: any): ICalendar[] {
  var data: ICalendar[] = [];
  tempData.map((e: any, i: number) => {
    data.push({
      startDay: e["Start day"],
      time: e["Time"],
      monday: e["Monday"],
      tuesday: e["Tuesday"],
      wednesday: e["Wednesday"],
      thursday: e["Thursday"],
      friday: e["Friday"],
    });
  });
  return data;
}

function process_json_data(data: ICalendar[], facultyName: string): IFaculty {
  //for five timeslot
  function resolve5rows(startRow: number, rowFormat: number) {
    const daysFrom1900To1970 = 25567;
    const millisecond =
      (data[startRow].startDay - 2 - daysFrom1900To1970) * 86400 * 1000;

    const startDate: Date = new Date(millisecond);
    daysOfWeek.map((day: typeDaysOfWeek, i) => {
      var tempDate: Date = new Date(millisecond);
      const milSec = tempDate.setDate(startDate.getDate() + i);
      for (var row = 0; row < rowFormat; row++) {
        //to process generic input, substitute 5 with {var}
        //convert key
        var key = row;
        if (row % Math.floor(rowFormat / 2) == 1) {
          if (row == Math.floor(rowFormat / 2)) continue; //and 2 with {var}/2
          if (key > Math.floor(rowFormat / 2)) key--;
        }

        if (rowFormat < 4) {
          addOneRecord(startRow + row, day, milSec, key * 2);
          addOneRecord(startRow + row, day, milSec, key * 2 + 1);
        } else {
          addOneRecord(startRow + row, day, milSec, key);
        }
      }
    });
  }

  //row == startRow + row
  const addOneRecord = (
    row: number,
    day: typeDaysOfWeek,
    milSec: number,
    key: number
  ) => {
    if (data[row][day] === undefined) {
      //replace undefined
      resData[facultyName][milSec] = {
        ...resData[facultyName][milSec],
        [key]: "free",
      };
    } else {
      //add key
      resData[facultyName][milSec] = {
        ...resData[facultyName][milSec],
        [key]: data[row][day],
      };
    }
  };

  const rowsNum = data.length;
  const resData: IFaculty = { [facultyName]: {} };
  //first 5 rows
  //get startDate
  //case divide by 5
  const rowFormat = countRowData(data);

  for (var i = 0; i < rowsNum; i = i + rowFormat) {
    resolve5rows(i, rowFormat);
  }

  return resData;
}

function countRowData(data: ICalendar[]) {
  let count = 1;
  while (true) {
    if (data[count].startDay !== undefined) break;
    count++;
  }

  return count;
}

export default async function importExcel(
  file: File,
  facultyName: string
): Promise<IFaculty> {
  const wb = await file_to_wb(file);
  const ws = wb.Sheets[wb.SheetNames[0]]; // get the first worksheet
  const rawData = utils.sheet_to_json(ws); // generate objects
  const goodData: ICalendar[] = processToICalendar(rawData);

  const data = process_json_data(goodData, facultyName);

  console.log("==============data in funct======================");
  console.log(data);
  console.log("====================================");
  return data;
}
