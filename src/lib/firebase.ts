import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, get } from "firebase/database";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
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
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Database references
export const sensorsRef = ref(database, "sensors");
export const patientsRef = ref(database, "patients");
export const alertsRef = ref(database, "alerts");
export const usersRef = ref(database, "users");

// User role type
export type UserRole = "patient" | "doctor" | "admin";

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Admin email constant
const ADMIN_EMAIL = "admin@diabetescare.com";

// Auth functions
export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signupWithEmail = async (email: string, password: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;
  
  // Determine role - admin@diabetescare.com gets admin role
  const role: UserRole = user.email === ADMIN_EMAIL ? "admin" : "patient";
  
  // Store user data in Realtime Database
  const userData: UserData = {
    uid: user.uid,
    name: name,
    email: user.email || email,
    role: role,
    createdAt: new Date().toISOString()
  };
  
  await set(ref(database, `users/${user.uid}`), userData);
  
  return { user, userData };
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  // Check if user exists in database
  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);
  
  if (!snapshot.exists()) {
    // New user - determine role
    const role: UserRole = user.email === ADMIN_EMAIL ? "admin" : "patient";
    
    const userData: UserData = {
      uid: user.uid,
      name: user.displayName || "User",
      email: user.email || "",
      role: role,
      createdAt: new Date().toISOString()
    };
    
    await set(userRef, userData);
    return { user, userData };
  }
  
  return { user, userData: snapshot.val() as UserData };
};

export const logout = async () => {
  await signOut(auth);
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  
  if (snapshot.exists()) {
    return snapshot.val() as UserData;
  }
  
  return null;
};

export const getAllUsers = async (): Promise<UserData[]> => {
  const snapshot = await get(usersRef);
  
  if (snapshot.exists()) {
    const usersObj = snapshot.val();
    return Object.values(usersObj) as UserData[];
  }
  
  return [];
};

// Helper functions
export { onValue, ref, push, set, get, onAuthStateChanged };
export type { DatabaseReference, User };
