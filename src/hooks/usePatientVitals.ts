import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../lib/firebase';
import { Vitals, DeviceStatus, Alert } from '../types';

export const usePatientVitals = (patientId: string | undefined) => {
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const vitalsRef = ref(database, `patients/${patientId}/vitals`);
    const statusRef = ref(database, `patients/${patientId}/status`);
    const alertsRef = ref(database, `patients/${patientId}/alerts`);

    const vitalsUnsubscribe = onValue(vitalsRef, (snapshot) => {
      setVitals(snapshot.val());
      setLoading(false);
    });

    const statusUnsubscribe = onValue(statusRef, (snapshot) => {
      setStatus(snapshot.val());
    });

    const alertsUnsubscribe = onValue(alertsRef, (snapshot) => {
      setAlerts(snapshot.val());
    });

    return () => {
      off(vitalsRef);
      off(statusRef);
      off(alertsRef);
    };
  }, [patientId]);

  return { vitals, status, alerts, loading };
};
