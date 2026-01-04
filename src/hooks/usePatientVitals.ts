import { useState, useEffect } from 'react';
import { database, ref, onValue } from '@/lib/firebase';

export interface Vitals {
  temperature: number;
  humidity: number;
  heartRate: number;
  spO2: number;
  glucose: number;
  timestamp?: number | string;
}

export interface DeviceStatus {
  deviceConnected: boolean;
  max30100_online: boolean;
  lastUpdate: string;
  rssi: number;
}

export interface PatientAlerts {
  active: boolean;
  message: string;
}

export const usePatientVitals = (patientId: string | null) => {
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [alerts, setAlerts] = useState<PatientAlerts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    console.log("🔗 usePatientVitals - Listening to:", `patients/${patientId}/vitals`);

    // Listen to vitals
    const vitalsRef = ref(database, `patients/${patientId}/vitals`);
    const statusRef = ref(database, `patients/${patientId}/status`);
    const alertsRef = ref(database, `patients/${patientId}/alerts`);

    const vitalsUnsubscribe = onValue(vitalsRef, (snapshot) => {
      console.log("📡 Vitals snapshot exists:", snapshot.exists());
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("📡 Raw vitals data:", data);
        setVitals(data);
      } else {
        setVitals(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("❌ Vitals error:", error);
      setLoading(false);
    });

    const statusUnsubscribe = onValue(statusRef, (snapshot) => {
      console.log("📡 Status snapshot exists:", snapshot.exists());
      if (snapshot.exists()) {
        setStatus(snapshot.val());
      }
    });

    const alertsUnsubscribe = onValue(alertsRef, (snapshot) => {
      console.log("📡 Alerts snapshot exists:", snapshot.exists());
      if (snapshot.exists()) {
        setAlerts(snapshot.val());
      }
    });

    // Cleanup listeners
    return () => {
      vitalsUnsubscribe();
      statusUnsubscribe();
      alertsUnsubscribe();
    };
  }, [patientId]);

  return { vitals, status, alerts, loading };
};
