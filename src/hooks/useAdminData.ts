import { useState, useEffect, useCallback } from "react";
import { 
  database, 
  ref, 
  onValue, 
  getAllUsers, 
  getUsersByRole,
  updateUserData,
  deleteUser,
  assignPatientToDoctor,
  unassignPatientFromDoctor,
  getAllAssignments,
  sendPasswordReset,
  UserData,
  UserRole
} from "@/lib/firebase";

export interface PatientVitals {
  temperature: number;
  heartRate: number;
  spo2: number;
  glucose: number;
  humidity: number;
  timestamp: string;
}

export interface SystemPatient {
  patientId: string;
  name: string;
  userId?: string;
  vitals: PatientVitals | null;
  lastUpdated: string | null;
  isConnected: boolean;
  assignedDoctorId?: string;
}

export interface SystemAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface UseAdminDataReturn {
  // Users
  allUsers: UserData[];
  patients: UserData[];
  doctors: UserData[];
  admins: UserData[];
  familyMembers: UserData[];
  
  // System data
  systemPatients: SystemPatient[];
  systemAlerts: SystemAlert[];
  assignments: Record<string, string[]>;
  
  // Stats
  totalConnectedDevices: number;
  criticalAlerts: number;
  
  // Loading
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateUser: (uid: string, updates: Partial<UserData>) => Promise<void>;
  removeUser: (uid: string) => Promise<void>;
  assignPatient: (doctorId: string, patientId: string) => Promise<void>;
  unassignPatient: (doctorId: string, patientId: string) => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

/**
 * Hook for admin dashboard - full system access
 * Admins can see all users, all patients, all data
 */
export const useAdminData = (userData: UserData | null): UseAdminDataReturn => {
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [systemPatients, setSystemPatients] = useState<SystemPatient[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      const assigns = await getAllAssignments();
      setAssignments(assigns);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchAssignments()]);
  }, [fetchUsers, fetchAssignments]);

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      setError("Access denied - Admin only");
      setIsLoading(false);
      return;
    }

    let unsubPatients: (() => void) | undefined;

    const initialize = async () => {
      try {
        await refreshData();

        // Listen to all patients data in real-time
        const patientsRef = ref(database, "patients");
        unsubPatients = onValue(patientsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const patientsList: SystemPatient[] = [];
            const alertsList: SystemAlert[] = [];

            Object.entries(data).forEach(([patientId, patientData]: [string, any]) => {
              // Extract vitals
              let latestVitals: PatientVitals | null = null;
              if (patientData.vitals) {
                if (patientData.vitals.timestamp) {
                  latestVitals = patientData.vitals;
                } else {
                  const vitalsArray = Object.values(patientData.vitals) as PatientVitals[];
                  vitalsArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                  latestVitals = vitalsArray[0] || null;
                }
              }

              const info = patientData.info || {};
              patientsList.push({
                patientId,
                name: info.name || `Patient ${patientId}`,
                userId: info.userId,
                vitals: latestVitals,
                lastUpdated: latestVitals?.timestamp || null,
                isConnected: !!latestVitals,
                assignedDoctorId: info.assignedDoctorId,
              });

              // Extract alerts
              if (patientData.alerts) {
                Object.entries(patientData.alerts).forEach(([alertId, alertData]: [string, any]) => {
                  alertsList.push({
                    id: alertId,
                    patientId,
                    patientName: info.name || `Patient ${patientId}`,
                    type: alertData.type,
                    message: alertData.message,
                    timestamp: alertData.timestamp,
                    isRead: alertData.isRead || false,
                  });
                });
              }
            });

            setSystemPatients(patientsList);
            setSystemAlerts(alertsList.sort((a, b) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            ));
          }
          setIsLoading(false);
        }, (err) => {
          console.error("Firebase patients error:", err);
          setIsLoading(false);
        });

      } catch (err) {
        console.error("Admin data initialization error:", err);
        setError("Failed to load admin data");
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (unsubPatients) unsubPatients();
    };
  }, [userData, refreshData]);

  const updateUser = async (uid: string, updates: Partial<UserData>) => {
    try {
      await updateUserData(uid, updates);
      await fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  };

  const removeUser = async (uid: string) => {
    try {
      await deleteUser(uid);
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      throw err;
    }
  };

  const assignPatient = async (doctorId: string, patientId: string) => {
    try {
      await assignPatientToDoctor(doctorId, patientId);
      await fetchAssignments();
    } catch (err) {
      console.error("Error assigning patient:", err);
      throw err;
    }
  };

  const unassignPatient = async (doctorId: string, patientId: string) => {
    try {
      await unassignPatientFromDoctor(doctorId, patientId);
      await fetchAssignments();
    } catch (err) {
      console.error("Error unassigning patient:", err);
      throw err;
    }
  };

  const resetUserPassword = async (email: string) => {
    try {
      await sendPasswordReset(email);
    } catch (err) {
      console.error("Error sending password reset:", err);
      throw err;
    }
  };

  const patients = allUsers.filter(u => u.role === "patient");
  const doctors = allUsers.filter(u => u.role === "doctor");
  const admins = allUsers.filter(u => u.role === "admin");
  const familyMembers = allUsers.filter(u => u.role === "family");
  const totalConnectedDevices = systemPatients.filter(p => p.isConnected).length;
  const criticalAlerts = systemAlerts.filter(a => a.type === "critical" && !a.isRead).length;

  return {
    allUsers,
    patients,
    doctors,
    admins,
    familyMembers,
    systemPatients,
    systemAlerts,
    assignments,
    totalConnectedDevices,
    criticalAlerts,
    isLoading,
    error,
    updateUser,
    removeUser,
    assignPatient,
    unassignPatient,
    resetUserPassword,
    refreshData,
  };
};
