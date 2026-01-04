import { useState, useEffect, useCallback, useRef } from "react";
import { database, ref, onValue, set, UserData } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";

export interface PatientVitals {
  temperature: number;
  heartRate: number;
  spo2: number;
  glucose: number;
  humidity: number;
  timestamp: string | number; // Support both ISO string and Unix timestamp from Firebase
}

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

export interface MLPrediction {
  riskLevel: "low" | "medium" | "high" | "critical";
  anomalyStatus: boolean;
  confidence: number;
  predictedCondition?: string;
  analysis?: string;
  recommendations?: string[];
  timestamp: string;
}

export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  condition: string;
  roomNumber: string;
}

const VITAL_THRESHOLDS = {
  temperature: { min: 36.0, max: 37.5, criticalMin: 35.0, criticalMax: 39.0 },
  heartRate: { min: 60, max: 100, criticalMin: 40, criticalMax: 150 },
  spo2: { min: 95, max: 100, criticalMin: 90, criticalMax: 100 },
  glucose: { min: 70, max: 140, criticalMin: 54, criticalMax: 250 },
};

const generateSimulatedVitals = (): PatientVitals => ({
  temperature: Number((36.5 + Math.random() * 2).toFixed(1)),
  heartRate: 65 + Math.floor(Math.random() * 40),
  spo2: 94 + Math.floor(Math.random() * 6),
  glucose: 80 + Math.floor(Math.random() * 80),
  humidity: 40 + Math.floor(Math.random() * 30),
  timestamp: new Date().toISOString(),
});

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

export interface UsePatientRealtimeDataReturn {
  vitals: PatientVitals | null;
  vitalsHistory: PatientVitals[];
  alerts: PatientAlert[];
  mlPrediction: MLPrediction | null;
  patientInfo: PatientInfo | null;
  isConnected: boolean;
  lastUpdated: string | null;
  delaySeconds: number; // Live delay indicator
  error: string | null;
  isSimulated: boolean;
}

/**
 * Hook for patient dashboard - only fetches data for the logged-in patient
 * Uses userData.patientId to isolate data access
 */
export const usePatientRealtimeData = (userData: UserData | null): UsePatientRealtimeDataReturn => {
  const [vitals, setVitals] = useState<PatientVitals | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<PatientVitals[]>([]);
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const lastAnalysisTime = useRef<number>(0);
  const analysisInProgress = useRef<boolean>(false);

  // Get patientId from userData - patients use their own patientId
  const patientId = userData?.patientId || (userData?.role === "patient" ? `patient_${userData.uid.slice(0, 8)}` : null);

  // Track raw timestamp from Firebase (in milliseconds)
  const [lastTimestampMs, setLastTimestampMs] = useState<number | null>(null);

  // Update delay timer every second using raw timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastTimestampMs) {
        const now = Date.now();
        setDelaySeconds(Math.floor((now - lastTimestampMs) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastTimestampMs]);

  const analyzeVitalsWithAI = useCallback(async (currentVitals: PatientVitals, history: PatientVitals[]) => {
    const now = Date.now();
    if (now - lastAnalysisTime.current < 10000 || analysisInProgress.current || !patientId) return;

    lastAnalysisTime.current = now;
    analysisInProgress.current = true;

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('analyze-vitals', {
        body: {
          temperature: currentVitals.temperature,
          humidity: currentVitals.humidity,
          heartRate: currentVitals.heartRate,
          spO2: currentVitals.spo2,
          glucose: currentVitals.glucose,
          patientId,
          historicalData: history.slice(-5).map(v => ({
            temperature: v.temperature,
            humidity: v.humidity,
            heartRate: v.heartRate,
            spO2: v.spo2,
            glucose: v.glucose,
          })),
        },
      });

      if (!invokeError && data && !data.error) {
        setMlPrediction({
          riskLevel: data.riskLevel,
          anomalyStatus: data.anomalyDetected,
          confidence: data.confidence,
          predictedCondition: data.predictedCondition,
          analysis: data.analysis,
          recommendations: data.recommendations,
          timestamp: data.timestamp,
        });

        try {
          const mlRef = ref(database, `patients/${patientId}/ml`);
          await set(mlRef, {
            riskLevel: data.riskLevel,
            anomalyStatus: data.anomalyDetected,
            confidence: data.confidence,
            predictedCondition: data.predictedCondition || null,
            analysis: data.analysis,
            timestamp: data.timestamp,
          });
        } catch (fbError) {
          console.log("Could not write ML prediction to Firebase:", fbError);
        }
      }
    } catch (err) {
      console.error("Failed to analyze vitals:", err);
    } finally {
      analysisInProgress.current = false;
    }
  }, [patientId]);

  const processVitals = useCallback((newVitals: PatientVitals, history: PatientVitals[]) => {
    const newAlerts: PatientAlert[] = [];
    
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

    analyzeVitalsWithAI(newVitals, history);
  }, [analyzeVitalsWithAI]);

  useEffect(() => {
    if (!patientId || !userData || userData.role !== "patient") {
      setError("No patient ID available");
      return;
    }

    let unsubVitals: (() => void) | undefined;
    let unsubAlerts: (() => void) | undefined;
    let unsubML: (() => void) | undefined;
    let unsubInfo: (() => void) | undefined;
    let simulationInterval: NodeJS.Timeout | undefined;

    const startSimulation = () => {
      if (simulationInterval) return;
      
      setIsSimulated(true);
      setIsConnected(true);
      
      const initialVitals = generateSimulatedVitals();
      const initialHistory = [initialVitals];
      setVitals(initialVitals);
      setVitalsHistory(initialHistory);
      processVitals(initialVitals, initialHistory);
      const nowMs = Date.now();
      setLastUpdated(new Date(nowMs).toISOString());
      setLastTimestampMs(nowMs);
      
      setPatientInfo({
        id: patientId,
        name: userData.name,
        age: 45,
        condition: "Diabetes Monitoring",
        roomNumber: "Room-101",
      });

      simulationInterval = setInterval(() => {
        const newVitals = generateSimulatedVitals();
        setVitals(newVitals);
        setVitalsHistory(prev => {
          const newHistory = [...prev.slice(-19), newVitals];
          processVitals(newVitals, newHistory);
          return newHistory;
        });
        const nowMs = Date.now();
        setLastUpdated(new Date(nowMs).toISOString());
        setLastTimestampMs(nowMs);
      }, 3000);
    };

    const setupListeners = () => {
      try {
        // Only listen to THIS patient's data - strict isolation
        const vitalsRef = ref(database, `patients/${patientId}/vitals`);
        const alertsRef = ref(database, `patients/${patientId}/alerts`);
        const mlRef = ref(database, `patients/${patientId}/ml`);
        const infoRef = ref(database, `patients/${patientId}/info`);

        unsubVitals = onValue(vitalsRef, (snapshot) => {
          if (snapshot.exists()) {
            setIsSimulated(false);
            const data = snapshot.val();
            let readings: PatientVitals[] = [];
            
            if (typeof data === 'object' && data !== null) {
              if (data.timestamp) {
                // Single vitals object
                readings = [data as PatientVitals];
              } else {
                // Multiple readings under push keys
                readings = Object.values(data) as PatientVitals[];
              }
            }
            
            if (readings.length > 0) {
              // Parse timestamps - support both ISO strings and Unix timestamps
              readings.sort((a, b) => {
                const timeA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
                const timeB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
                return timeB - timeA;
              });
              const latestVitals = readings[0];
              const historySlice = readings.slice(0, 20);
              
              // Calculate raw timestamp in ms from Firebase data
              const rawTimestampMs = typeof latestVitals.timestamp === 'number' 
                ? latestVitals.timestamp 
                : new Date(latestVitals.timestamp).getTime();
              
              setVitals(latestVitals);
              setVitalsHistory(historySlice);
              processVitals(latestVitals, historySlice);
              setLastUpdated(typeof latestVitals.timestamp === 'number' 
                ? new Date(latestVitals.timestamp).toISOString() 
                : latestVitals.timestamp);
              setLastTimestampMs(rawTimestampMs);
              setIsConnected(true);
            }
          } else {
            startSimulation();
          }
        }, () => {
          startSimulation();
        });

        unsubAlerts = onValue(alertsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const alertList = Object.entries(data).map(([key, value]: [string, any]) => ({
              id: key,
              ...value,
            })) as PatientAlert[];
            setAlerts(alertList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
          }
        });

        unsubML = onValue(mlRef, (snapshot) => {
          if (snapshot.exists()) {
            setMlPrediction(snapshot.val() as MLPrediction);
          }
        });

        unsubInfo = onValue(infoRef, (snapshot) => {
          if (snapshot.exists()) {
            setPatientInfo({ id: patientId, ...snapshot.val() } as PatientInfo);
          } else {
            setPatientInfo({
              id: patientId,
              name: userData.name,
              age: 45,
              condition: "Diabetes Monitoring",
              roomNumber: "Room-101",
            });
          }
        });

      } catch (err) {
        console.error("Firebase setup error:", err);
        startSimulation();
      }
    };

    setupListeners();

    return () => {
      if (unsubVitals) unsubVitals();
      if (unsubAlerts) unsubAlerts();
      if (unsubML) unsubML();
      if (unsubInfo) unsubInfo();
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, [patientId, userData, processVitals]);

  return {
    vitals,
    vitalsHistory,
    alerts,
    mlPrediction,
    patientInfo,
    isConnected,
    lastUpdated,
    delaySeconds,
    error,
    isSimulated,
  };
};
