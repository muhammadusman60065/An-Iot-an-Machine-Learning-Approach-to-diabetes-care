import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Alert {
  message: string;
  timestamp: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  active: boolean;
}

interface AlertHistoryProps {
  patientId: string;
  limit?: number;
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({ patientId, limit = 10 }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const alertsRef = ref(database, `patients/${patientId}/alertHistory`);
    
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      if (snapshot.exists()) {
        const alertsData = snapshot.val();
        const alertsList: Alert[] = Object.values(alertsData);
        
        // Sort by timestamp descending
        const sortedAlerts = alertsList
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        
        setAlerts(sortedAlerts);
      } else {
        setAlerts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [patientId, limit]);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return { icon: AlertTriangle, bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800' };
      case 'HIGH':
        return { icon: AlertTriangle, bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-800' };
      case 'MEDIUM':
        return { icon: Info, bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800' };
      default:
        return { icon: Info, bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert History</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert History</h3>
      
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">No alerts recorded</p>
          <p className="text-sm text-gray-500">All vitals have been normal</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map((alert, index) => {
            const config = getSeverityConfig(alert.severity);
            const Icon = config.icon;
            
            return (
              <div 
                key={index}
                className={`${config.bg} border-l-4 ${config.border} p-4 rounded-lg`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${config.text} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${config.text} uppercase`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(alert.timestamp * 1000), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-sm ${config.text}`}>{alert.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
