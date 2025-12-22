import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set } from "firebase/database";
import type { DatabaseReference } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC9ZpMm5wh3AqMche8vgddFUYCbkFjpsJQ",
  authDomain: "diabetescare-iot.firebaseapp.com",
  databaseURL: "https://diabetescare-iot-default-rtdb.firebaseio.com",
  projectId: "diabetescare-iot",
  storageBucket: "diabetescare-iot.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Database references
export const sensorsRef = ref(database, "sensors");
export const patientsRef = ref(database, "patients");
export const alertsRef = ref(database, "alerts");
export const usersRef = ref(database, "users");

// Helper functions
export { onValue, ref, push, set };
export type { DatabaseReference };
