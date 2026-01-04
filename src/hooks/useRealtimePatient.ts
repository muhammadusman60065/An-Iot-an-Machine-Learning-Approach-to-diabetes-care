import { useState, useEffect, useCallback } from "react";
import { database, ref, onValue, set, push } from "@/lib/firebase";

// Vitals data structure from IoT devices
export interface PatientVitals {
  temperature: number;
  heartRate: number;
  spo2: number;
  glucose: number;
  humidity: number;
  timestamp: string;
}

// Alert structure
export interface PatientAlert {
  id: string;
  type: "critical" | "warning" | "info";
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// ML Prediction placeholder structure
export interface MLPrediction {
  riskLevel: "low" | "medium" | "high" | "critical";
  anomalyStatus: boolean;
  confidence: number;
  predictedCondition: string;
  timestamp: string;
}

// Patient info
export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  condition: string;
  roomNumber: string;
}

export interface UseRealtimePatientReturn {
  vitals: PatientVitals | null;
  vitalsHistory: PatientVitals[];
  alerts: PatientAlert[];
  mlPrediction: MLPrediction | null;
  patientInfo: PatientInfo | null;
  isConnected: boolean;
  lastUpdated: string | null;
  error: string | null;
}

// Thresholds for generating alerts
const VITAL_THRESHOLDS = {
  temperature: { min: 36.0, max: 37.5, criticalMin: 35.0, criticalMax: 39.0 },
  heartRate: { min: 60, max: 100, criticalMin: 40, criticalMax: 150 },
  spo2: { min: 95, max: 100, criticalMin: 90, criticalMax: 100 },
  glucose: { min: 70, max: 140, criticalMin: 54, criticalMax: 250 },
};

// Generate simulated vitals for demo
const generateSimulatedVitals = (): PatientVitals => ({
  temperature: 36.5 + Math.random() * 2,
  heartRate: 65 + Math.floor(Math.random() * 40),
  spo2: 94 + Math.floor(Math.random() * 6),
  glucose: 80 + Math.floor(Math.random() * 80),
  humidity: 40 + Math.floor(Math.random() * 30),
  timestamp: new Date().toISOString(),
});

// Check if vital is in alert range
const checkVitalAlert = (
  metric: string,
  value: number,
  thresholds: { min: number; max: number; criticalMin: number; criticalMax: number }
): PatientAlert | null => {
  const timestamp = new Date().toISOString();
  
  if (value <= thresholds.criticalMin || value >= thresholds.criticalMax) {
    return {
      id: `${metric}-${Date.now()}`,
      type: "critical",
      metric,
      value,
      threshold: value < thresholds.min ? thresholds.criticalMin : thresholds.criticalMax,
      message: `Critical ${metric} level: ${value.toFixed(1)}`,
      timestamp,
      isRead: false,
    };
  }
  
  if (value < thresholds.min || value > thresholds.max) {
    return {
      id: `${metric}-${Date.now()}`,
      type: "warning",
      metric,
      value,
      threshold: value < thresholds.min ? thresholds.min : thresholds.max,
      message: `Abnormal ${metric}: ${value.toFixed(1)}`,
      timestamp,
      isRead: false,
    };
  }
  
  return null;
};

export const useRealtimePatient = (patientId: string): UseRealtimePatientReturn => {
  const [vitals, setVitals] = useState<PatientVitals | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<PatientVitals[]>([]);
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Process vitals and generate alerts
  const processVitals = useCallback((newVitals: PatientVitals) => {
    const newAlerts: PatientAlert[] = [];
    
    // Check each vital against thresholds
    const tempAlert = checkVitalAlert("temperature", newVitals.temperature, VITAL_THRESHOLDS.temperature);
    if (tempAlert) newAlerts.push(tempAlert);
    
    const hrAlert = checkVitalAlert("heartRate", newVitals.heartRate, VITAL_THRESHOLDS.heartRate);
    if (hrAlert) newAlerts.push(hrAlert);
    
    const spo2Alert = checkVitalAlert("spo2", newVitals.spo2, VITAL_THRESHOLDS.spo2);
    if (spo2Alert) newAlerts.push(spo2Alert);
    
    const glucoseAlert = checkVitalAlert("glucose", newVitals.glucose, VITAL_THRESHOLDS.glucose);
    if (glucoseAlert) newAlerts.push(glucoseAlert);
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
    }
  }, []);

  useEffect(() => {
    if (!patientId) return;

    let unsubVitals: (() => void) | undefined;
    let unsubAlerts: (() => void) | undefined;
    let unsubML: (() => void) | undefined;
    let unsubInfo: (() => void) | undefined;
    let simulationInterval: NodeJS.Timeout | undefined;

    const setupListeners = () => {
      try {
        // Firebase paths as specified
        const vitalsRef = ref(database, `patients/${patientId}/vitals`);
        const alertsRef = ref(database, `patients/${patientId}/alerts`);
        const mlRef = ref(database, `patients/${patientId}/ml`);
        const infoRef = ref(database, `patients/${patientId}/info`);

        // Listen for real-time vitals updates
        unsubVitals = onValue(vitalsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Get the latest vital reading
            const readings = Object.values(data) as PatientVitals[];
            if (readings.length > 0) {
              const latestVitals = readings[readings.length - 1];
              setVitals(latestVitals);
              setVitalsHistory(readings.slice(-20));
              processVitals(latestVitals);
              setLastUpdated(latestVitals.timestamp);
              setIsConnected(true);
            }
          } else {
            // No data in Firebase - use simulated data for demo
            console.log("No vitals data in Firebase, using simulated data");
            startSimulation();
          }
        }, (err) => {
          console.error("Firebase vitals error:", err);
          setError("Failed to connect to vitals data");
          startSimulation();
        });

        // Listen for alerts
        unsubAlerts = onValue(alertsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const alertList = Object.entries(data).map(([key, value]: [string, any]) => ({
              id: key,
              ...value,
            })) as PatientAlert[];
            setAlerts(prev => [...alertList, ...prev.filter(a => !alertList.find(b => b.id === a.id))].slice(0, 50));
          }
        });

        // Listen for ML predictions (placeholder for future integration)
        unsubML = onValue(mlRef, (snapshot) => {
          if (snapshot.exists()) {
            setMlPrediction(snapshot.val() as MLPrediction);
          }
        });

        // Listen for patient info
        unsubInfo = onValue(infoRef, (snapshot) => {
          if (snapshot.exists()) {
            setPatientInfo({ id: patientId, ...snapshot.val() } as PatientInfo);
          } else {
            // Default patient info for demo
            setPatientInfo({
              id: patientId,
              name: `Patient ${patientId}`,
              age: 45,
              condition: "Diabetes Type 2",
              roomNumber: "ICU-101",
            });
          }
        });

      } catch (err) {
        console.error("Firebase setup error:", err);
        setError("Failed to connect to Firebase");
        startSimulation();
      }
    };

    const startSimulation = () => {
      if (simulationInterval) return;
      
      console.log("Starting simulated data stream");
      setIsConnected(true);
      
      // Initial data
      const initialVitals = generateSimulatedVitals();
      setVitals(initialVitals);
      setVitalsHistory([initialVitals]);
      processVitals(initialVitals);
      setLastUpdated(initialVitals.timestamp);
      
      // Set default patient info
      setPatientInfo({
        id: patientId,
        name: `Patient ${patientId}`,
        age: 45,
        condition: "Diabetes Type 2",
        roomNumber: "ICU-101",
      });

      // Simulate real-time updates every 3 seconds
      simulationInterval = setInterval(() => {
        const newVitals = generateSimulatedVitals();
        setVitals(newVitals);
        setVitalsHistory(prev => [...prev.slice(-19), newVitals]);
        processVitals(newVitals);
        setLastUpdated(newVitals.timestamp);
      }, 3000);
    };

    setupListeners();

    return () => {
      if (unsubVitals) unsubVitals();
      if (unsubAlerts) unsubAlerts();
      if (unsubML) unsubML();
      if (unsubInfo) unsubInfo();
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, [patientId, processVitals]);

  return {
    vitals,
    vitalsHistory,
    alerts,
    mlPrediction,
    patientInfo,
    isConnected,
    lastUpdated,
    error,
  };
};

// Hook to get all patients
export const useAllPatients = () => {
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const patientsRef = ref(database, "patients");
    
    const unsubscribe = onValue(patientsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const patientList = Object.keys(data).map(id => ({
          id,
          ...data[id].info,
        })) as PatientInfo[];
        setPatients(patientList);
      } else {
        // Demo patients
        setPatients([
          { id: "P001", name: "John Doe", age: 45, condition: "Diabetes Type 2", roomNumber: "ICU-101" },
          { id: "P002", name: "Jane Smith", age: 62, condition: "Hypertension", roomNumber: "ICU-102" },
          { id: "P003", name: "Robert Johnson", age: 55, condition: "Cardiac Patient", roomNumber: "ICU-103" },
        ]);
      }
      setIsLoading(false);
    }, () => {
      // Demo patients on error
      setPatients([
        { id: "P001", name: "John Doe", age: 45, condition: "Diabetes Type 2", roomNumber: "ICU-101" },
        { id: "P002", name: "Jane Smith", age: 62, condition: "Hypertension", roomNumber: "ICU-102" },
        { id: "P003", name: "Robert Johnson", age: 55, condition: "Cardiac Patient", roomNumber: "ICU-103" },
      ]);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { patients, isLoading };
};
