import { useState, useEffect, useCallback } from "react";
import { 
  database, 
  ref, 
  onValue, 
  get,
  getAllUsers, 
  getUsersByRole,
  updateUserData,
  deleteUser,
  assignPatientToDoctor,
  unassignPatientFromDoctor,
  getAllAssignments,
  normalizeAssignedPatients,
  UserData,
  UserRole
} from "@/lib/firebase";

export interface PatientVitals {
  temperature: number;
  heartRate: number;
  spo2: number;
  glucose: number;
  humidity: number;
  timestamp: number;
  bloodPressure?: string;
}

export interface SystemPatient {
  patientId: string;
  name: string;
  userId?: string;
  vitals: PatientVitals | null;
  lastUpdated: number | null;
  isConnected: boolean;
  assignedDoctorId?: string;
  diabetesType?: string;
  age?: number;
}

export interface SystemAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: number;
  isRead: boolean;
  severity?: string;
}

export interface UseAdminDataReturn {
  // Users
  allUsers: UserData[];
  patients: UserData[];
  doctors: UserData[];
  admins: UserData[];
  
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
  refreshData: () => Promise<void>;
}

// Helper to normalize timestamp
const normalizeTimestamp = (ts: number | string | undefined): number => {
  if (!ts) return 0;
  if (typeof ts === 'string') {
    const parsed = Date.parse(ts);
    return isNaN(parsed) ? 0 : parsed;
  }
  return ts > 10000000000 ? ts : ts * 1000;
};

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

        // Get users to map patientId -> user profile
        const usersRef = ref(database, "users");
        const usersSnapshot = await get(usersRef);
        const patientUserMap = new Map<string, { uid: string; name: string; age?: number; diabetesType?: string; assignedDoctor?: string }>();
        
        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          Object.entries(users).forEach(([uid, userData]: [string, any]) => {
            if (userData.patientId) {
              patientUserMap.set(userData.patientId, {
                uid,
                name: userData.profile?.name || userData.name || `Patient ${userData.patientId}`,
                age: userData.profile?.age,
                diabetesType: userData.profile?.diabetesType,
                assignedDoctor: userData.assignedDoctor,
              });
            }
          });
        }

        // Listen to all patients data in real-time
        const patientsRef = ref(database, "patients");
        unsubPatients = onValue(patientsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const patientsList: SystemPatient[] = [];
            const alertsList: SystemAlert[] = [];

            Object.entries(data).forEach(([patientId, patientData]: [string, any]) => {
              // Extract vitals - handle direct vitals object
              let latestVitals: PatientVitals | null = null;
              if (patientData.vitals) {
                latestVitals = {
                  temperature: patientData.vitals.temperature || 0,
                  heartRate: patientData.vitals.heartRate || 0,
                  spo2: patientData.vitals.spO2 || 0,
                  glucose: patientData.vitals.glucose || 0,
                  humidity: patientData.vitals.humidity || 0,
                  timestamp: normalizeTimestamp(patientData.vitals.timestamp),
                  bloodPressure: patientData.vitals.bloodPressure,
                };
              }

              // Get user profile info
              const userInfo = patientUserMap.get(patientId);
              const medicalProfile = patientData.medicalProfile || {};
              const deviceStatus = patientData.status || {};

              patientsList.push({
                patientId,
                name: userInfo?.name || `Patient ${patientId}`,
                userId: userInfo?.uid,
                vitals: latestVitals,
                lastUpdated: latestVitals?.timestamp || null,
                isConnected: deviceStatus.deviceConnected !== false && !!latestVitals,
                assignedDoctorId: userInfo?.assignedDoctor,
                diabetesType: userInfo?.diabetesType || medicalProfile.diabetesType,
                age: userInfo?.age || medicalProfile.age,
              });

              // Extract current alert
              if (patientData.alerts && patientData.alerts.message) {
                const severity = patientData.alerts.severity?.toUpperCase();
                alertsList.push({
                  id: 'current_' + patientId,
                  patientId,
                  patientName: userInfo?.name || `Patient ${patientId}`,
                  type: severity === 'CRITICAL' ? 'critical' : severity === 'HIGH' ? 'warning' : 'info',
                  message: patientData.alerts.message,
                  timestamp: normalizeTimestamp(patientData.alerts.timestamp),
                  isRead: patientData.alerts.acknowledged || false,
                  severity: patientData.alerts.severity,
                });
              }

              // Extract alert history
              if (patientData.alertHistory) {
                Object.entries(patientData.alertHistory).forEach(([alertId, alertData]: [string, any]) => {
                  const severity = alertData.severity?.toUpperCase();
                  alertsList.push({
                    id: alertId,
                    patientId,
                    patientName: userInfo?.name || `Patient ${patientId}`,
                    type: severity === 'CRITICAL' ? 'critical' : severity === 'HIGH' ? 'warning' : 'info',
                    message: alertData.message,
                    timestamp: normalizeTimestamp(alertData.timestamp),
                    isRead: alertData.acknowledged || false,
                    severity: alertData.severity,
                  });
                });
              }
            });

            setSystemPatients(patientsList);
            setSystemAlerts(alertsList.sort((a, b) => b.timestamp - a.timestamp));
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

  const patients = allUsers.filter(u => u.role === "patient");
  const doctors = allUsers.filter(u => u.role === "doctor");
  const admins = allUsers.filter(u => u.role === "admin");
  const totalConnectedDevices = systemPatients.filter(p => p.isConnected).length;
  const criticalAlerts = systemAlerts.filter(a => a.type === "critical" && !a.isRead).length;

  return {
    allUsers,
    patients,
    doctors,
    admins,
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
    refreshData,
  };
};
