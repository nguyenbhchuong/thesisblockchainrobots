import { IData } from "@/type/dataType";
import { getDatabase, ref, set } from "firebase/database";
import app from "./firebase";

export default function writeDataServer(data: IData) {
  const db = getDatabase(app);
  set(ref(db, "/"), data);
}
