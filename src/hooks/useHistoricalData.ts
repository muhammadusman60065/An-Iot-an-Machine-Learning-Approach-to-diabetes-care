import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';

interface HistoricalReading {
  timestamp: number;
  temperature: number;
  heartRate: number;
  spO2: number;
  glucose: number;
  humidity: number;
}

export const useHistoricalData = (patientId: string | undefined, limit: number = 20) => {
  const [data, setData] = useState<HistoricalReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    // Store readings in a history node
    const historyRef = ref(database, `patients/${patientId}/history`);
    
    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const historyData = snapshot.val();
        const readings: HistoricalReading[] = Object.values(historyData);
        
        // Sort by timestamp and limit
        const sortedData = readings
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(-limit);
        
        setData(sortedData);
      } else {
        setData([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [patientId, limit]);

  return { data, loading };
};
