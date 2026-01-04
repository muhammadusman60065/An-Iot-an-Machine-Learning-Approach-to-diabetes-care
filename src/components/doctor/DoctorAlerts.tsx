import React, { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDoctorPatients, PatientAlert } from '@/hooks/useDoctorPatients';
import { UserData } from '@/lib/firebase';

interface DoctorAlertsProps {
  userData: UserData | null;
}

type FilterType = 'all' | 'critical' | 'warning' | 'info';

const DoctorAlerts: React.FC<DoctorAlertsProps> = ({ userData }) => {
  const { assignedPatients, allAlerts, criticalCount, warningCount, isLoading } = useDoctorPatients(userData);
  const [filter, setFilter] = useState<FilterType>('all');

  // Collect all alerts from all patients
  const allPatientAlerts = assignedPatients.flatMap(patient => 
    patient.alerts.map(alert => ({
      ...alert,
      patientName: patient.name,
      patientId: patient.patientId,
    }))
  );

  // Also add ML prediction alerts for critical/high risk patients
  const mlAlerts = assignedPatients
    .filter(p => p.mlPrediction?.riskLevel === 'critical' || p.mlPrediction?.riskLevel === 'high')
    .map(p => ({
      id: `ml-${p.patientId}`,
      type: p.mlPrediction?.riskLevel === 'critical' ? 'critical' : 'warning' as 'critical' | 'warning',
      metric: 'ML Prediction',
      value: p.mlPrediction?.confidence || 0,
      message: `${p.name} has ${p.mlPrediction?.riskLevel} risk level (${Math.round((p.mlPrediction?.confidence || 0) * 100)}% confidence)`,
      timestamp: p.mlPrediction?.timestamp || new Date().toISOString(),
      isRead: false,
      patientName: p.name,
      patientId: p.patientId,
    }));

  const combinedAlerts = [...allPatientAlerts, ...mlAlerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredAlerts = filter === 'all' 
    ? combinedAlerts 
    : combinedAlerts.filter(a => a.type === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts Center</h1>
        <p className="text-muted-foreground">Monitor critical and warning alerts from your patients</p>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warning Alerts</p>
                <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({combinedAlerts.length})
        </Button>
        <Button
          variant={filter === 'critical' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('critical')}
          className={filter === 'critical' ? '' : 'text-red-600 border-red-200'}
        >
          Critical ({combinedAlerts.filter(a => a.type === 'critical').length})
        </Button>
        <Button
          variant={filter === 'warning' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('warning')}
          className={filter === 'warning' ? '' : 'text-yellow-600 border-yellow-200'}
        >
          Warning ({combinedAlerts.filter(a => a.type === 'warning').length})
        </Button>
        <Button
          variant={filter === 'info' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('info')}
        >
          Info ({combinedAlerts.filter(a => a.type === 'info').length})
        </Button>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={18} />
            {filter === 'all' ? 'All Alerts' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Alerts`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'critical' 
                    ? 'bg-red-50 border-red-500' 
                    : alert.type === 'warning' 
                    ? 'bg-yellow-50 border-yellow-500' 
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {alert.type === 'critical' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      {alert.type === 'warning' && <Bell className="w-4 h-4 text-yellow-600" />}
                      <span className="font-medium">{alert.patientName}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        alert.type === 'critical' ? 'bg-red-100 text-red-700' :
                        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.metric} • {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
            {filteredAlerts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No {filter === 'all' ? '' : filter} alerts at this time</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAlerts;
