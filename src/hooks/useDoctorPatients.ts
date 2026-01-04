import { useState, useEffect, useCallback } from "react";
import { database, ref, onValue, getDoctorAssignments, UserData } from "@/lib/firebase";

export interface PatientVitals {
  temperature: number;
  heartRate: number;
  spo2: number;
  glucose: number;
  humidity: number;
  timestamp: string;
}

export interface PatientAlert {
  id: string;
  type: "critical" | "warning" | "info";
  metric: string;
  value: number;
  message: string;
  timestamp: string;
  isRead: boolean;
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
  name: string;
  age: number;
  condition: string;
  roomNumber: string;
  vitals: PatientVitals | null;
  alerts: PatientAlert[];
  mlPrediction: MLPrediction | null;
  lastUpdated: string | null;
  delaySeconds: number;
  isConnected: boolean;
}

export interface UseDoctorPatientsReturn {
  assignedPatients: PatientFullData[];
  allAlerts: PatientAlert[];
  criticalCount: number;
  warningCount: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for doctor dashboard - fetches only assigned patients' data
 * Doctors can only see patients that are assigned to them
 */
export const useDoctorPatients = (userData: UserData | null): UseDoctorPatientsReturn => {
  const [assignedPatients, setAssignedPatients] = useState<PatientFullData[]>([]);
  const [allAlerts, setAllAlerts] = useState<PatientAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update delay for all patients every second
  useEffect(() => {
    const interval = setInterval(() => {
      setAssignedPatients(prev => prev.map(p => {
        if (p.lastUpdated) {
          const lastTime = new Date(p.lastUpdated).getTime();
          const now = Date.now();
          return { ...p, delaySeconds: Math.floor((now - lastTime) / 1000) };
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

    const fetchAssignedPatients = async () => {
      try {
        // Get doctor's assigned patients
        const patientIds = await getDoctorAssignments(userData.uid);
        
        // If no assignments, use demo data
        if (patientIds.length === 0) {
          setAssignedPatients(generateDemoPatients());
          setIsLoading(false);
          return;
        }

        // Set up real-time listeners for each assigned patient
        patientIds.forEach(patientId => {
          const patientRef = ref(database, `patients/${patientId}`);
          
          const unsub = onValue(patientRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              
              // Extract vitals
              let latestVitals: PatientVitals | null = null;
              if (data.vitals) {
                if (data.vitals.timestamp) {
                  latestVitals = data.vitals;
                } else {
                  const vitalsArray = Object.values(data.vitals) as PatientVitals[];
                  vitalsArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                  latestVitals = vitalsArray[0] || null;
                }
              }

              // Extract alerts
              const alerts: PatientAlert[] = data.alerts 
                ? Object.entries(data.alerts).map(([key, value]: [string, any]) => ({
                    id: key,
                    patientId,
                    ...value,
                  }))
                : [];

              // Extract ML prediction
              const mlPrediction: MLPrediction | null = data.ml || null;

              // Extract patient info
              const info = data.info || {};

              patientDataMap.set(patientId, {
                patientId,
                name: info.name || `Patient ${patientId}`,
                age: info.age || 45,
                condition: info.condition || "Diabetes Type 2",
                roomNumber: info.roomNumber || "ICU-101",
                vitals: latestVitals,
                alerts,
                mlPrediction,
                lastUpdated: latestVitals?.timestamp || null,
                delaySeconds: latestVitals ? Math.floor((Date.now() - new Date(latestVitals.timestamp).getTime()) / 1000) : 0,
                isConnected: !!latestVitals,
              });

              // Update state
              setAssignedPatients(Array.from(patientDataMap.values()));
              
              // Aggregate all alerts
              const allPatientAlerts = Array.from(patientDataMap.values())
                .flatMap(p => p.alerts.map(a => ({ ...a, patientName: p.name })))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              setAllAlerts(allPatientAlerts);
            }
          });

          unsubscribes.push(unsub);
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching assigned patients:", err);
        setError("Failed to load patient data");
        setAssignedPatients(generateDemoPatients());
        setIsLoading(false);
      }
    };

    fetchAssignedPatients();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [userData]);

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
  };
};

// Generate demo patients when no real assignments exist
function generateDemoPatients(): PatientFullData[] {
  const demoPatients = [
    { name: "John Smith", age: 45, condition: "Diabetes Type 2", roomNumber: "ICU-101" },
    { name: "Mary Johnson", age: 62, condition: "Hypertension", roomNumber: "ICU-102" },
    { name: "Robert Williams", age: 55, condition: "Cardiac Patient", roomNumber: "ICU-103" },
  ];

  return demoPatients.map((p, i) => {
    const timestamp = new Date(Date.now() - Math.random() * 60000).toISOString();
    return {
      patientId: `demo_patient_${i + 1}`,
      name: p.name,
      age: p.age,
      condition: p.condition,
      roomNumber: p.roomNumber,
      vitals: {
        temperature: Number((36.5 + Math.random() * 2).toFixed(1)),
        heartRate: 65 + Math.floor(Math.random() * 40),
        spo2: 94 + Math.floor(Math.random() * 6),
        glucose: 80 + Math.floor(Math.random() * 80),
        humidity: 40 + Math.floor(Math.random() * 30),
        timestamp,
      },
      alerts: [],
      mlPrediction: {
        riskLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
        anomalyStatus: Math.random() > 0.7,
        confidence: 0.85 + Math.random() * 0.1,
        timestamp,
      },
      lastUpdated: timestamp,
      delaySeconds: Math.floor(Math.random() * 30),
      isConnected: true,
    };
  });
}
