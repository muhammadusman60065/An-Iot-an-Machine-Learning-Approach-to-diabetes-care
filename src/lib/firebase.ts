import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, get } from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { DatabaseReference } from "firebase/database";

/**
 * NOTE:
 * This file intentionally exports simplified types (AuthUser) and casts Firebase SDK
 * objects to `any` to avoid extremely deep type graphs that can crash some TS toolchains.
 */

const firebaseConfig = {
  apiKey: "AIzaSyC9ZpMm5wh3AqMche8vgddFUYCbkFjpsJQ",
  authDomain: "diabetes-monitoring-fyp.firebaseapp.com",
  databaseURL: "https://diabetes-monitoring-fyp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "diabetes-monitoring-fyp",
  storageBucket: "diabetes-monitoring-fyp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Casts are deliberate: keep exported surface area type-light.
export const auth: any = getAuth(app) as any;
const googleProvider: any = new GoogleAuthProvider();

// Database references
export const sensorsRef = ref(database, "sensors");
export const patientsRef = ref(database, "patients");
export const alertsRef = ref(database, "alerts");
export const usersRef = ref(database, "users");

export type UserRole = "patient" | "doctor" | "admin";

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type AuthUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
};

const ADMIN_EMAIL = "admin@diabetescare.com";

const toAuthUser = (u: any): AuthUser => ({
  uid: u?.uid,
  email: u?.email ?? null,
  displayName: u?.displayName ?? null,
});

export const onAuthUserChanged = (cb: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, (u) => cb(u ? toAuthUser(u) : null));
};

export const loginWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  const result: any = await signInWithEmailAndPassword(auth, email, password);
  return toAuthUser(result.user);
};

export const signupWithEmail = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: AuthUser; userData: UserData }> => {
  const result: any = await createUserWithEmailAndPassword(auth, email, password);
  const user = toAuthUser(result.user);

  const role: UserRole = user.email === ADMIN_EMAIL ? "admin" : "patient";

  const userData: UserData = {
    uid: user.uid,
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
  };

  await set(ref(database, `users/${user.uid}`), userData);

  return { user, userData };
};

export const loginWithGoogle = async (): Promise<{ user: AuthUser; userData: UserData }> => {
  const result: any = await signInWithPopup(auth, googleProvider);
  const user = toAuthUser(result.user);

  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    const role: UserRole = user.email === ADMIN_EMAIL ? "admin" : "patient";

    const userData: UserData = {
      uid: user.uid,
      name: user.displayName || "User",
      email: user.email || "",
      role,
      createdAt: new Date().toISOString(),
    };

    await set(userRef, userData);
    return { user, userData };
  }

  return { user, userData: snapshot.val() as UserData };
};

export const logout = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? (snapshot.val() as UserData) : null;
};

export const getAllUsers = async (): Promise<UserData[]> => {
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) return [];
  const usersObj = snapshot.val();
  return Object.values(usersObj) as UserData[];
};

// Re-export Realtime DB helpers
export { onValue, ref, push, set, get };
export type { DatabaseReference };
