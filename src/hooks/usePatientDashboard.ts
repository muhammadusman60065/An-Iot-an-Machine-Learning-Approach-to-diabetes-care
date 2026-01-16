import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, query, orderByChild, startAt, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Vitals, DeviceStatus, Alert } from '@/types';

export interface HistoricalReading {
  timestamp: number;
  temperature: number;
  heartRate: number;
  spO2: number;
  glucose: number;
  humidity: number;
  bloodPressure?: string;
}

export interface AlertHistoryItem {
  id: string;
  message: string;
  timestamp: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  active: boolean;
}

export interface PatientDashboardData {
  vitals: Vitals | null;
  status: DeviceStatus | null;
  currentAlert: Alert | null;
  alertHistory: AlertHistoryItem[];
  history24h: HistoricalReading[];
  isConnected: boolean;
  lastUpdated: Date | null;
  loading: boolean;
}

// Helper to convert Unix timestamp (seconds) to milliseconds
const normalizeTimestamp = (ts: number | string | undefined): number => {
  if (!ts) return 0;
  if (typeof ts === 'string') {
    const parsed = Date.parse(ts);
    return isNaN(parsed) ? 0 : parsed;
  }
  // Unix timestamps in seconds are typically < 10 billion
  return ts > 10000000000 ? ts : ts * 1000;
};

export const usePatientDashboard = (patientId: string | null | undefined): PatientDashboardData => {
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>([]);
  const [history24h, setHistory24h] = useState<HistoricalReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];

    // Real-time vitals listener
    const vitalsRef = ref(database, `patients/${patientId}/vitals`);
    const vitalsUnsub = onValue(vitalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Normalize vitals data with proper field mapping
        setVitals({
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
          heartRate: data.heartRate || 0,
          spO2: data.spO2 || 0,
          glucose: data.glucose || 0,
          timestamp: normalizeTimestamp(data.timestamp),
        });
        setLastUpdated(new Date());
      }
      setLoading(false);
    });
    unsubscribes.push(vitalsUnsub);

    // Status listener
    const statusRef = ref(database, `patients/${patientId}/status`);
    const statusUnsub = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setStatus({
          deviceConnected: data.deviceConnected !== false,
          max30100_online: data.max30102_online || data.max30100_online || false,
          rssi: data.rssi || 0,
          lastUpdate: data.lastUpdate,
        });
      }
    });
    unsubscribes.push(statusUnsub);

    // Current alert listener
    const alertRef = ref(database, `patients/${patientId}/alerts`);
    const alertUnsub = onValue(alertRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Handle the alert object structure from Firebase
        if (data.message) {
          setCurrentAlert({
            active: data.active || false,
            message: data.message,
            timestamp: String(normalizeTimestamp(data.timestamp)),
            severity: data.severity || 'LOW',
          });
        } else {
          setCurrentAlert(null);
        }
      } else {
        setCurrentAlert(null);
      }
    });
    unsubscribes.push(alertUnsub);

    // Alert history listener
    const alertHistoryRef = ref(database, `patients/${patientId}/alertHistory`);
    const alertHistoryUnsub = onValue(alertHistoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const alerts: AlertHistoryItem[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          message: value.message || '',
          timestamp: normalizeTimestamp(value.timestamp),
          severity: value.severity || 'LOW',
          active: value.active || false,
        }));
        // Sort by timestamp descending
        alerts.sort((a, b) => b.timestamp - a.timestamp);
        setAlertHistory(alerts.slice(0, 20)); // Last 20 alerts
      } else {
        setAlertHistory([]);
      }
    });
    unsubscribes.push(alertHistoryUnsub);

    // 24-hour history listener
    const historyRef = ref(database, `patients/${patientId}/history`);
    const historyUnsub = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const readings: HistoricalReading[] = Object.values(data).map((r: any) => ({
          timestamp: normalizeTimestamp(r.timestamp),
          temperature: r.temperature || 0,
          heartRate: r.heartRate || 0,
          spO2: r.spO2 || 0,
          glucose: r.glucose || 0,
          humidity: r.humidity || 0,
          bloodPressure: r.bloodPressure,
        }));
        
        // Filter to last 24 hours and sort
        const now = Date.now();
        const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
        
        const filtered = readings
          .filter(r => r.timestamp >= twentyFourHoursAgo)
          .sort((a, b) => a.timestamp - b.timestamp);
        
        setHistory24h(filtered);
      } else {
        setHistory24h([]);
      }
    });
    unsubscribes.push(historyUnsub);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [patientId]);

  const isConnected = vitals !== null && status?.deviceConnected !== false;

  return {
    vitals,
    status,
    currentAlert,
    alertHistory,
    history24h,
    isConnected,
    lastUpdated,
    loading,
  };
};
