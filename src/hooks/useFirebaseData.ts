import { useState, useEffect, useCallback } from "react";
import { database, sensorsRef, alertsRef, onValue, ref } from "@/lib/firebase";
import { detectAnomalies, generateAlert } from "@/lib/anomalyDetection";
import { SensorReading, HealthAlert, Patient, AnomalyResult, HEALTH_THRESHOLDS } from "@/types/health";

interface UseFirebaseDataReturn {
  currentReading: SensorReading | null;
  readingHistory: SensorReading[];
  alerts: HealthAlert[];
  patients: Patient[];
  anomalyResult: AnomalyResult | null;
  isLoading: boolean;
  error: string | null;
  isSimulated: boolean;
}

// Generate simulated data for demo purposes
function generateSimulatedReading(): SensorReading {
  return {
    userId: "demo-patient-1",
    timestamp: Date.now(),
    glucose: Math.floor(Math.random() * 60) + 90,
    heartRate: Math.floor(Math.random() * 30) + 65,
    temperature: Number((Math.random() * 1.5 + 36).toFixed(1)),
    deviceId: "ESP8266-SIM-001",
  };
}

// Generate simulated historical data
function generateHistoricalData(hours: number = 8): SensorReading[] {
  const data: SensorReading[] = [];
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 8;

  for (let i = 7; i >= 0; i--) {
    data.push({
      userId: "demo-patient-1",
      timestamp: now - i * interval,
      glucose: Math.floor(Math.random() * 50) + 85,
      heartRate: Math.floor(Math.random() * 25) + 65,
      temperature: Number((Math.random() * 1.2 + 36.2).toFixed(1)),
      deviceId: "ESP8266-SIM-001",
    });
  }
  return data;
}

// Generate simulated patients for doctor view
function generateSimulatedPatients(): Patient[] {
  const names = [
    "John Smith",
    "Mary Johnson",
    "Robert Williams",
    "Sarah Davis",
    "Michael Brown",
    "Emily Wilson",
  ];

  return names.map((name, index) => {
    const glucose = Math.floor(Math.random() * 100) + 70;

    return {
      id: `patient-${index + 1}`,
      name,
      age: Math.floor(Math.random() * 40) + 30,
      lastReading: {
        userId: `patient-${index + 1}`,
        timestamp: Date.now() - Math.floor(Math.random() * 30) * 60000,
        glucose,
        heartRate: Math.floor(Math.random() * 30) + 65,
        temperature: Number((Math.random() * 1 + 36.2).toFixed(1)),
      },
    };
  });
}

export function useFirebaseData(userId?: string): UseFirebaseDataReturn {
  const [currentReading, setCurrentReading] = useState<SensorReading | null>(null);
  const [readingHistory, setReadingHistory] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [anomalyResult, setAnomalyResult] = useState<AnomalyResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  const processReading = useCallback((reading: SensorReading) => {
    const anomaly = detectAnomalies(reading);
    setAnomalyResult(anomaly);

    if (anomaly.status !== "normal") {
      const alert = generateAlert(reading, anomaly);
      if (alert) {
        setAlerts((prev) => [alert, ...prev].slice(0, 10));
      }
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    let unsubscribeSensors: (() => void) | undefined;
    let unsubscribeAlerts: (() => void) | undefined;
    let simulationInterval: ReturnType<typeof setInterval> | undefined;

    try {
      const userSensorsRef = userId
        ? ref(database, `sensors/${userId}`)
        : sensorsRef;

      unsubscribeSensors = onValue(
        userSensorsRef,
        (snapshot) => {
          const data = snapshot.val();

          if (data) {
            setIsSimulated(false);
            const readings: SensorReading[] = Object.values(data);
            const sortedReadings = readings.sort(
              (a, b) => b.timestamp - a.timestamp
            );

            const latest = sortedReadings[0];
            setCurrentReading(latest);
            setReadingHistory(sortedReadings.slice(0, 20));
            processReading(latest);
          } else {
            console.log("No Firebase data found, using simulated data");
            setIsSimulated(true);

            const simulated = generateSimulatedReading();
            const history = generateHistoricalData();

            setCurrentReading(simulated);
            setReadingHistory(history);
            processReading(simulated);

            simulationInterval = setInterval(() => {
              const newReading = generateSimulatedReading();
              setCurrentReading(newReading);
              setReadingHistory((prev) => [newReading, ...prev.slice(0, 19)]);
              processReading(newReading);
            }, 10000);
          }

          setIsLoading(false);
        },
        (err) => {
          console.error("Firebase error:", err);
          setError("Failed to connect to database");
          setIsSimulated(true);

          const simulated = generateSimulatedReading();
          setCurrentReading(simulated);
          setReadingHistory(generateHistoricalData());
          processReading(simulated);
          setIsLoading(false);
        }
      );

      unsubscribeAlerts = onValue(alertsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const alertList: HealthAlert[] = Object.entries(data).map(
            ([key, value]) => ({
              ...(value as HealthAlert),
              id: key,
            })
          );
          setAlerts(alertList.sort((a, b) => b.timestamp - a.timestamp));
        }
      });

      setPatients(generateSimulatedPatients());
    } catch (err) {
      console.error("Error setting up Firebase listeners:", err);
      setError("Failed to initialize data connection");
      setIsSimulated(true);

      const simulated = generateSimulatedReading();
      setCurrentReading(simulated);
      setReadingHistory(generateHistoricalData());
      processReading(simulated);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribeSensors) unsubscribeSensors();
      if (unsubscribeAlerts) unsubscribeAlerts();
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, [userId, processReading]);

  return {
    currentReading,
    readingHistory,
    alerts,
    patients,
    anomalyResult,
    isLoading,
    error,
    isSimulated,
  };
}

export { HEALTH_THRESHOLDS };
