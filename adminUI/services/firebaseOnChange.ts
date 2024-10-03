import { getDatabase, ref, onValue } from "firebase/database";
import app from "./firebase";

const db = getDatabase(app);
const dataRef = ref(db, "/");
onValue(dataRef, (snapshot) => {
  const data = snapshot.val();
});
