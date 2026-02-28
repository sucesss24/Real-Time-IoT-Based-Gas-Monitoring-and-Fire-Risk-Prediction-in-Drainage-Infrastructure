import { getDatabase, ref, onValue, off } from "firebase/database";
import { app } from "./firebaseConfig";

const db = getDatabase(app);

export const listenSensorData = (callback) => {
  const sensorRef = ref(db, "sensorData");

  onValue(sensorRef, (snapshot) => {
    const rawData = snapshot.val();
    if (!rawData) return;

    console.log("🔥 Raw Firebase Data:", rawData);
    callback(rawData);
  });
  onValue(ref(db, "/"), (snapshot) => {
  console.log("FULL DB:", snapshot.val());
});

  return () => off(sensorRef);
};