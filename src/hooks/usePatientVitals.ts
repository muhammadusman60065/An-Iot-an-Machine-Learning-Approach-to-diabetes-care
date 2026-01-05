import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../lib/firebase';
import { Vitals, DeviceStatus, Alert } from '../types';

interface UsePatientVitalsReturn {
  vitals: Vitals | null;
  status: DeviceStatus | null;
  alerts: Alert | null;
  loading: boolean;
  error: string | null;
}

export const usePatientVitals = (patientId: string | null): UsePatientVitalsReturn => {
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const vitalsRef = ref(database, `patients/${patientId}/vitals`);
    const statusRef = ref(database, `patients/${patientId}/status`);
    const alertsRef = ref(database, `patients/${patientId}/alerts`);

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 3) {
        setLoading(false);
      }
    };

    // Listen to vitals
    const vitalsUnsubscribe = onValue(
      vitalsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setVitals(snapshot.val() as Vitals);
        } else {
          setVitals(null);
        }
        checkLoaded();
      },
      (err) => {
        console.error('Error fetching vitals:', err);
        setError('Failed to load vitals data');
        checkLoaded();
      }
    );

    // Listen to device status
    const statusUnsubscribe = onValue(
      statusRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setStatus(snapshot.val() as DeviceStatus);
        } else {
          setStatus(null);
        }
        checkLoaded();
      },
      (err) => {
        console.error('Error fetching status:', err);
        setError('Failed to load device status');
        checkLoaded();
      }
    );

    // Listen to alerts
    const alertsUnsubscribe = onValue(
      alertsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setAlerts(snapshot.val() as Alert);
        } else {
          setAlerts(null);
        }
        checkLoaded();
      },
      (err) => {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts');
        checkLoaded();
      }
    );

    // Cleanup listeners on unmount
    return () => {
      vitalsUnsubscribe();
      statusUnsubscribe();
      alertsUnsubscribe();
    };
  }, [patientId]);

  return { vitals, status, alerts, loading, error };
};

export default usePatientVitals;
