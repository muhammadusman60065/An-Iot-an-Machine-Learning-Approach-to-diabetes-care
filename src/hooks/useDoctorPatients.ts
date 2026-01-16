import { useState, useEffect, useCallback } from "react";
import { database, ref, onValue, get, getDoctorAssignments, UserData } from "@/lib/firebase";

export interface PatientVitals {
  temperature: number;
  heartRate: number;
  spo2: number;
  glucose: number;
  humidity: number;
  timestamp: number | string;
  bloodPressure?: string;
}

export interface PatientAlert {
  id: string;
  type: "critical" | "warning" | "info";
  metric: string;
  value: number;
  message: string;
  timestamp: string | number;
  isRead: boolean;
  severity?: string;
}

export interface MLPrediction {
  riskLevel: "low" | "medium" | "high" | "critical";
  anomalyStatus: boolean;
  confidence: number;
  analysis?: string;
  timestamp: string;
}

export interface PatientFullData {
  patientId: string;
  patientUid?: string;
  name: string;
  age: number;
  condition: string;
  roomNumber: string;
  vitals: PatientVitals | null;
  alerts: PatientAlert[];
  mlPrediction: MLPrediction | null;
  lastUpdated: number | null;
  delaySeconds: number;
  isConnected: boolean;
  diabetesType?: string;
  assignedDoctor?: string;
}

export interface UseDoctorPatientsReturn {
  assignedPatients: PatientFullData[];
  allAlerts: PatientAlert[];
  criticalCount: number;
  warningCount: number;
  isLoading: boolean;
  error: string | null;
  refreshPatients: () => void;
}

// Helper to format timestamp
const formatTimestamp = (ts: number | string | undefined): number | null => {
  if (!ts) return null;
  // If it's already a number (Unix timestamp in seconds)
  if (typeof ts === 'number') {
    // Check if it's in seconds or milliseconds
    return ts > 10000000000 ? ts : ts * 1000;
  }
  // If it's a string, try to parse it
  const parsed = Date.parse(ts);
  return isNaN(parsed) ? null : parsed;
};

// Helper to determine risk level from alerts
const getRiskLevelFromAlerts = (alerts: any): "low" | "medium" | "high" | "critical" => {
  if (!alerts) return "low";
  const severity = alerts.severity?.toUpperCase();
  if (severity === "CRITICAL") return "critical";
  if (severity === "HIGH") return "high";
  if (severity === "MEDIUM") return "medium";
  return "low";
};

/**
 * Hook for doctor dashboard - fetches only assigned patients' data
 * Doctors can only see patients that are assigned to them
 */
export const useDoctorPatients = (userData: UserData | null): UseDoctorPatientsReturn => {
  const [assignedPatients, setAssignedPatients] = useState<PatientFullData[]>([]);
  const [allAlerts, setAllAlerts] = useState<PatientAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshPatients = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Update delay for all patients every second
  useEffect(() => {
    const interval = setInterval(() => {
      setAssignedPatients(prev => prev.map(p => {
        if (p.lastUpdated) {
          const now = Date.now();
          return { ...p, delaySeconds: Math.floor((now - p.lastUpdated) / 1000) };
        }
        return p;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userData || userData.role !== "doctor") {
      setError("Access denied");
      setIsLoading(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];
    let patientDataMap = new Map<string, PatientFullData>();
    let patientUserMap = new Map<string, { uid: string; profile: any; }>(); // Map patientId to user profile

    const fetchAssignedPatients = async () => {
      try {
        // Get doctor's assigned patients from Firebase
        const patientIds = await getDoctorAssignments(userData.uid);
        
        // If no assignments, show empty state
        if (patientIds.length === 0) {
          setAssignedPatients([]);
          setIsLoading(false);
          return;
        }

        // First, fetch all users to get patient profiles by patientId
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          Object.entries(users).forEach(([uid, userData]: [string, any]) => {
            if (userData.patientId && patientIds.includes(userData.patientId)) {
              patientUserMap.set(userData.patientId, {
                uid,
                profile: {
                  name: userData.profile?.name || userData.name || `Patient ${userData.patientId}`,
                  age: userData.profile?.age || 0,
                  diabetesType: userData.profile?.diabetesType || 'Unknown',
                  gender: userData.profile?.gender,
                  contactNumber: userData.profile?.contactNumber,
                  ...userData.profile,
                }
              });
            }
          });
        }

        // Set up real-time listeners for each assigned patient
        patientIds.forEach(patientId => {
          const patientRef = ref(database, `patients/${patientId}`);
          
          const unsub = onValue(patientRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              
              // Extract vitals - handle the direct vitals object
              let latestVitals: PatientVitals | null = null;
              if (data.vitals) {
                latestVitals = {
                  temperature: data.vitals.temperature || 0,
                  heartRate: data.vitals.heartRate || 0,
                  spo2: data.vitals.spO2 || 0,
                  glucose: data.vitals.glucose || 0,
                  humidity: data.vitals.humidity || 0,
                  timestamp: data.vitals.timestamp || 0,
                  bloodPressure: data.vitals.bloodPressure,
                };
              }

              // Extract alerts - handle the alerts object structure
              const alertsList: PatientAlert[] = [];
              if (data.alerts) {
                // Current alert
                if (data.alerts.message) {
                  alertsList.push({
                    id: 'current',
                    type: data.alerts.severity === 'CRITICAL' ? 'critical' : data.alerts.severity === 'HIGH' ? 'warning' : 'info',
                    metric: 'vitals',
                    value: 0,
                    message: data.alerts.message,
                    timestamp: data.alerts.timestamp,
                    isRead: data.alerts.acknowledged || false,
                    severity: data.alerts.severity,
                  });
                }
              }

              // Extract alert history
              if (data.alertHistory) {
                Object.entries(data.alertHistory).slice(-5).forEach(([key, value]: [string, any]) => {
                  alertsList.push({
                    id: key,
                    type: value.severity === 'CRITICAL' ? 'critical' : value.severity === 'HIGH' ? 'warning' : 'info',
                    metric: 'vitals',
                    value: 0,
                    message: value.message,
                    timestamp: value.timestamp,
                    isRead: value.acknowledged || false,
                    severity: value.severity,
                  });
                });
              }

              // Get ML prediction / risk level
              const mlPrediction: MLPrediction | null = data.alerts ? {
                riskLevel: getRiskLevelFromAlerts(data.alerts),
                anomalyStatus: data.alerts.active || false,
                confidence: 0.85,
                timestamp: String(data.alerts.timestamp || Date.now()),
              } : null;

              // Get patient info from users collection
              const userInfo = patientUserMap.get(patientId);
              const medicalProfile = data.medicalProfile || {};

              const lastUpdateTs = formatTimestamp(latestVitals?.timestamp);
              const isDeviceConnected = data.status?.deviceConnected !== false;

              patientDataMap.set(patientId, {
                patientId,
                patientUid: userInfo?.uid,
                name: userInfo?.profile?.name || `Patient ${patientId}`,
                age: userInfo?.profile?.age || medicalProfile.age || 0,
                condition: userInfo?.profile?.diabetesType || medicalProfile.diabetesType || "Unknown",
                roomNumber: "N/A",
                vitals: latestVitals,
                alerts: alertsList,
                mlPrediction,
                lastUpdated: lastUpdateTs,
                delaySeconds: lastUpdateTs ? Math.floor((Date.now() - lastUpdateTs) / 1000) : 0,
                isConnected: isDeviceConnected && !!latestVitals,
                diabetesType: medicalProfile.diabetesType,
              });

              // Update state
              setAssignedPatients(Array.from(patientDataMap.values()));
              
              // Aggregate all alerts
              const allPatientAlerts = Array.from(patientDataMap.values())
                .flatMap(p => p.alerts.map(a => ({ ...a, patientName: p.name })))
                .sort((a, b) => {
                  const tsA = formatTimestamp(a.timestamp) || 0;
                  const tsB = formatTimestamp(b.timestamp) || 0;
                  return tsB - tsA;
                });
              setAllAlerts(allPatientAlerts);
            }
          });

          unsubscribes.push(unsub);
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching assigned patients:", err);
        setError("Failed to load patient data from Firebase");
        setAssignedPatients([]);
        setIsLoading(false);
      }
    };

    fetchAssignedPatients();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [userData, refreshTrigger]);

  const criticalCount = assignedPatients.filter(p => 
    p.mlPrediction?.riskLevel === "critical" || 
    p.alerts.some(a => a.type === "critical" && !a.isRead)
  ).length;

  const warningCount = assignedPatients.filter(p => 
    p.mlPrediction?.riskLevel === "high" || 
    p.alerts.some(a => a.type === "warning" && !a.isRead)
  ).length;

  return {
    assignedPatients,
    allAlerts,
    criticalCount,
    warningCount,
    isLoading,
    error,
    refreshPatients,
  };
};
