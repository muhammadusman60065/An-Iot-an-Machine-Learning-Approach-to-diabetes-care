import React, { useState, useEffect } from 'react';
import { ref, query, orderByChild, startAt, onValue } from 'firebase/database';
import { database } from '../lib/firebase';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface StatsSummaryProps {
  patientId: string;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ patientId }) => {
  const [stats, setStats] = useState({
    avgTemp: 0,
    avgHR: 0,
    maxGlucose: 0,
    minGlucose: 0,
    totalAlerts: 0,
    readingsCount: 0
  });

  useEffect(() => {
    if (!patientId) return;

    // Get today's timestamp (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);

    const historyRef = ref(database, `patients/${patientId}/history`);
    const todayQuery = query(historyRef, orderByChild('timestamp'), startAt(todayTimestamp));

    const unsubscribe = onValue(todayQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const readings = Object.values(data) as any[];

        const sumTemp = readings.reduce((acc, r) => acc + (r.temperature || 0), 0);
        const sumHR = readings.reduce((acc, r) => acc + (r.heartRate || 0), 0);
        const glucoseValues = readings.map(r => r.glucose).filter(g => g > 0);

        setStats({
          avgTemp: readings.length > 0 ? sumTemp / readings.length : 0,
          avgHR: readings.length > 0 ? sumHR / readings.length : 0,
          maxGlucose: glucoseValues.length > 0 ? Math.max(...glucoseValues) : 0,
          minGlucose: glucoseValues.length > 0 ? Math.min(...glucoseValues) : 0,
          totalAlerts: 0,
          readingsCount: readings.length
        });
      }
    });

    return () => unsubscribe();
  }, [patientId]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Today's Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Avg Temperature"
          value={stats.avgTemp.toFixed(1)}
          unit="°C"
          icon={<TrendingUp className="w-4 h-4 text-green-600" />}
        />
        <StatCard
          label="Avg Heart Rate"
          value={stats.avgHR.toFixed(0)}
          unit="BPM"
          icon={<Activity className="w-4 h-4 text-blue-600" />}
        />
        <StatCard
          label="Max Glucose"
          value={stats.maxGlucose.toFixed(0)}
          unit="mg/dL"
          icon={<TrendingUp className="w-4 h-4 text-red-600" />}
        />
        <StatCard
          label="Min Glucose"
          value={stats.minGlucose.toFixed(0)}
          unit="mg/dL"
          icon={<TrendingDown className="w-4 h-4 text-green-600" />}
        />
        <StatCard
          label="Readings Today"
          value={stats.readingsCount.toString()}
          unit="total"
          icon={<Activity className="w-4 h-4 text-purple-600" />}
        />
        <StatCard
          label="Alerts"
          value={stats.totalAlerts.toString()}
          unit="today"
          icon={<TrendingUp className="w-4 h-4 text-orange-600" />}
        />
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
}> = ({ label, value, unit, icon }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-gray-600 font-medium">{label}</span>
      {icon}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500">{unit}</span>
    </div>
  </div>
);
