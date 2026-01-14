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
  messagingSenderId: "1032434555214",
  appId: "1:1032434555214:web:f5c505c4e41faafbd6e61f",
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

export type UserRole = "patient" | "doctor" | "admin" | "family";

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

// Find patient by email
export const findPatientByEmail = async (email: string): Promise<UserData | null> => {
  const allUsers = await getAllUsers();
  const patient = allUsers.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.role === "patient"
  );
  return patient || null;
};

// Add patient to doctor by email
export const addPatientToDoctorByEmail = async (doctorId: string, patientEmail: string): Promise<void> => {
  const patient = await findPatientByEmail(patientEmail);
  if (!patient) {
    throw new Error("Patient not found with this email");
  }
  if (!patient.patientId) {
    throw new Error("Patient does not have a linked device/patientId");
  }
  
  // Check if already assigned
  const existingAssignments = await getDoctorAssignments(doctorId);
  if (existingAssignments.includes(patient.patientId)) {
    throw new Error("This patient is already assigned to you");
  }
  
  // Add to doctorAssignments
  await assignPatientToDoctor(doctorId, patient.patientId);
};

// Update user data
export const updateUserData = async (uid: string, updates: Partial<UserData>): Promise<void> => {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) throw new Error("User not found");
  const current = snapshot.val() as UserData;
  await set(userRef, { ...current, ...updates });
};

// Update user profile (nested profile object)
export const updateUserProfile = async (uid: string, profileUpdates: Record<string, any>): Promise<void> => {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) throw new Error("User not found");
  const current = snapshot.val();
  const updatedProfile = { ...(current.profile || {}), ...profileUpdates };
  await set(userRef, { ...current, profile: updatedProfile });
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<Record<string, any> | null> => {
  const userRef = ref(database, `users/${uid}/profile`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
};

// Delete user
export const deleteUser = async (uid: string): Promise<void> => {
  const userRef = ref(database, `users/${uid}`);
  await set(userRef, null);
};

// Update user status (enable/disable)
export const updateUserStatus = async (uid: string, enabled: boolean): Promise<void> => {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) throw new Error("User not found");
  const current = snapshot.val();
  await set(userRef, { ...current, accountEnabled: enabled, status: enabled ? 'active' : 'disabled' });
};

// Create user with role (for admin to create users)
export const createUserWithRole = async (userData: Partial<UserData> & { email: string; role: UserRole }): Promise<void> => {
  // Generate a temporary UID for the user record
  const tempUid = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const userRef = ref(database, `users/${tempUid}`);
  
  const newUser: UserData = {
    uid: tempUid,
    name: userData.name || userData.email.split('@')[0],
    email: userData.email,
    role: userData.role,
    createdAt: new Date().toISOString(),
    patientId: userData.patientId,
    assignedPatients: userData.role === 'doctor' ? [] : undefined,
  };
  
  await set(userRef, newUser);
};

// Add family member to patient
export const addFamilyMemberToPatient = async (
  patientUid: string,
  familyEmail: string,
  relationship: string
): Promise<void> => {
  // Check if family member already exists
  const allUsers = await getAllUsers();
  let familyUser = allUsers.find(u => u.email.toLowerCase() === familyEmail.toLowerCase());
  
  if (familyUser && familyUser.role !== 'family') {
    throw new Error("This email is already registered with a different role");
  }
  
  // Get patient data
  const patientRef = ref(database, `users/${patientUid}`);
  const patientSnapshot = await get(patientRef);
  if (!patientSnapshot.exists()) throw new Error("Patient not found");
  const patientData = patientSnapshot.val();
  
  if (!patientData.patientId) {
    throw new Error("Patient does not have a linked device");
  }
  
  // Create family user if doesn't exist
  if (!familyUser) {
    const familyUid = `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const familyUserData: UserData = {
      uid: familyUid,
      name: familyEmail.split('@')[0],
      email: familyEmail,
      role: 'family' as UserRole,
      createdAt: new Date().toISOString(),
    };
    await set(ref(database, `users/${familyUid}`), {
      ...familyUserData,
      linkedPatient: patientData.patientId,
      linkedPatientUid: patientUid,
      relationship,
    });
    familyUser = { ...familyUserData, uid: familyUid };
  } else {
    // Update existing family user to link to patient
    await set(ref(database, `users/${familyUser.uid}`), {
      ...familyUser,
      linkedPatient: patientData.patientId,
      linkedPatientUid: patientUid,
      relationship,
    });
  }
  
  // Add to patient's familyMembers array
  const currentFamilyMembers = patientData.familyMembers || [];
  if (!currentFamilyMembers.includes(familyUser.uid)) {
    await set(patientRef, {
      ...patientData,
      familyMembers: [...currentFamilyMembers, familyUser.uid],
    });
  }
};

// Get family members for a patient
export const getPatientFamilyMembers = async (patientUid: string): Promise<UserData[]> => {
  const patientRef = ref(database, `users/${patientUid}`);
  const snapshot = await get(patientRef);
  if (!snapshot.exists()) return [];
  
  const patientData = snapshot.val();
  const familyMemberIds = patientData.familyMembers || [];
  
  const allUsers = await getAllUsers();
  return allUsers.filter(u => familyMemberIds.includes(u.uid));
};

// Assign patient to doctor
export const assignPatientToDoctor = async (doctorId: string, patientId: string): Promise<void> => {
  // Add to doctorAssignments path (matches your Firebase rules)
  const assignmentRef = ref(database, `doctorAssignments/${doctorId}/patients/${patientId}`);
  await set(assignmentRef, {
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
  // Remove from doctorAssignments
  const assignmentRef = ref(database, `doctorAssignments/${doctorId}/patients/${patientId}`);
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

// Get assigned patients for a doctor - updated to use doctorAssignments path
export const getDoctorAssignments = async (doctorId: string): Promise<string[]> => {
  // First try the new doctorAssignments path
  const newAssignmentsRef = ref(database, `doctorAssignments/${doctorId}/patients`);
  const newSnapshot = await get(newAssignmentsRef);
  if (newSnapshot.exists()) {
    return Object.keys(newSnapshot.val());
  }
  
  // Fallback to old assignments path for backward compatibility
  const oldAssignmentsRef = ref(database, `assignments/${doctorId}`);
  const oldSnapshot = await get(oldAssignmentsRef);
  if (oldSnapshot.exists()) {
    return Object.keys(oldSnapshot.val());
  }
  
  return [];
};

// Get all assignments (for admin)
export const getAllAssignments = async (): Promise<Record<string, string[]>> => {
  const result: Record<string, string[]> = {};
  
  // Try new path first
  const newAssignmentsRef = ref(database, "doctorAssignments");
  const newSnapshot = await get(newAssignmentsRef);
  if (newSnapshot.exists()) {
    const data = newSnapshot.val();
    Object.keys(data).forEach(doctorId => {
      if (data[doctorId].patients) {
        result[doctorId] = Object.keys(data[doctorId].patients);
      }
    });
    return result;
  }
  
  // Fallback to old path
  const oldAssignmentsRef = ref(database, "assignments");
  const oldSnapshot = await get(oldAssignmentsRef);
  if (oldSnapshot.exists()) {
    const data = oldSnapshot.val();
    Object.keys(data).forEach(doctorId => {
      result[doctorId] = Object.keys(data[doctorId]);
    });
  }
  
  return result;
};

// Re-export Realtime DB helpers
export { onValue, ref, push, set, get };
export type { DatabaseReference };
