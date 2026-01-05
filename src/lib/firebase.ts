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
  storageBucket: "diabetes-monitoring-fyp.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:placeholder",
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
  patientId?: string; // For patients: links to patients/{patientId} data
  assignedPatients?: string[]; // For doctors: list of patientIds they manage
}

export type AuthUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
};

// Doctor-Patient Assignment interface
export interface DoctorPatientAssignment {
  doctorId: string;
  patientId: string;
  assignedAt: string;
}

// Refs for assignments
export const assignmentsRef = ref(database, "assignments");

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

/**
 * Ensure the logged-in user has a profile row in Realtime DB.
 * This prevents "permission denied" / missing-user-data login dead-ends.
 */
export const ensureUserData = async (user: AuthUser): Promise<UserData> => {
  try {
    const existing = await getUserData(user.uid);
    if (existing) return existing;

    const email = user.email || "";
    const nameFromEmail = email.includes("@") ? email.split("@")[0] : "User";
    const role: UserRole = email === ADMIN_EMAIL ? "admin" : "patient";

    const userData: UserData = {
      uid: user.uid,
      name: user.displayName || nameFromEmail || "User",
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    await set(ref(database, `users/${user.uid}`), userData);
    return userData;
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.toLowerCase().includes("permission denied")) {
      throw new Error(
        "Permission denied reading/writing /users. Update Firebase Realtime Database Rules to allow authenticated users to read/write users/{uid}."
      );
    }
    throw err;
  }
};

export const getAllUsers = async (): Promise<UserData[]> => {
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) return [];
  const usersObj = snapshot.val();
  return Object.values(usersObj) as UserData[];
};

// Get users by role
export const getUsersByRole = async (role: UserRole): Promise<UserData[]> => {
  const allUsers = await getAllUsers();
  return allUsers.filter(u => u.role === role);
};

// Update user data
export const updateUserData = async (uid: string, updates: Partial<UserData>): Promise<void> => {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) throw new Error("User not found");
  const current = snapshot.val() as UserData;
  await set(userRef, { ...current, ...updates });
};

// Delete user
export const deleteUser = async (uid: string): Promise<void> => {
  const userRef = ref(database, `users/${uid}`);
  await set(userRef, null);
};

// Assign patient to doctor
export const assignPatientToDoctor = async (doctorId: string, patientId: string): Promise<void> => {
  const assignmentRef = ref(database, `assignments/${doctorId}/${patientId}`);
  await set(assignmentRef, {
    doctorId,
    patientId,
    assignedAt: new Date().toISOString(),
  });
  
  // Also update doctor's assignedPatients array
  const doctorRef = ref(database, `users/${doctorId}`);
  const doctorSnapshot = await get(doctorRef);
  if (doctorSnapshot.exists()) {
    const doctorData = doctorSnapshot.val() as UserData;
    const currentPatients = doctorData.assignedPatients || [];
    if (!currentPatients.includes(patientId)) {
      await set(doctorRef, { ...doctorData, assignedPatients: [...currentPatients, patientId] });
    }
  }
};

// Unassign patient from doctor
export const unassignPatientFromDoctor = async (doctorId: string, patientId: string): Promise<void> => {
  const assignmentRef = ref(database, `assignments/${doctorId}/${patientId}`);
  await set(assignmentRef, null);
  
  // Also update doctor's assignedPatients array
  const doctorRef = ref(database, `users/${doctorId}`);
  const doctorSnapshot = await get(doctorRef);
  if (doctorSnapshot.exists()) {
    const doctorData = doctorSnapshot.val() as UserData;
    const currentPatients = doctorData.assignedPatients || [];
    await set(doctorRef, { ...doctorData, assignedPatients: currentPatients.filter(p => p !== patientId) });
  }
};

// Get assigned patients for a doctor
export const getDoctorAssignments = async (doctorId: string): Promise<string[]> => {
  const assignmentsRef = ref(database, `assignments/${doctorId}`);
  const snapshot = await get(assignmentsRef);
  if (!snapshot.exists()) return [];
  return Object.keys(snapshot.val());
};

// Get all assignments (for admin)
export const getAllAssignments = async (): Promise<Record<string, string[]>> => {
  const assignmentsRef = ref(database, "assignments");
  const snapshot = await get(assignmentsRef);
  if (!snapshot.exists()) return {};
  
  const data = snapshot.val();
  const result: Record<string, string[]> = {};
  
  Object.keys(data).forEach(doctorId => {
    result[doctorId] = Object.keys(data[doctorId]);
  });
  
  return result;
};

// Re-export Realtime DB helpers
export { onValue, ref, push, set, get };
export type { DatabaseReference };
