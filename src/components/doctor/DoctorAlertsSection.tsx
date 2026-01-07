import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoctorPatients } from '@/hooks/useDoctorPatients';
import { UserData } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DoctorAlertsSectionProps {
  userData: UserData | null;
}

const DoctorAlertsSection: React.FC<DoctorAlertsSectionProps> = ({ userData }) => {
  const { assignedPatients, allAlerts, criticalCount, warningCount, isLoading } = useDoctorPatients(userData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getSeverityConfig = (type: string) => {
    switch (type) {
      case 'critical':
        return { 
          icon: AlertTriangle, 
          bg: 'bg-destructive/10', 
          border: 'border-destructive', 
          text: 'text-destructive',
          badge: 'bg-destructive text-destructive-foreground'
        };
      case 'warning':
        return { 
          icon: AlertTriangle, 
          bg: 'bg-warning/10', 
          border: 'border-warning', 
          text: 'text-warning',
          badge: 'bg-warning text-warning-foreground'
        };
      default:
        return { 
          icon: Info, 
          bg: 'bg-info/10', 
          border: 'border-info', 
          text: 'text-info',
          badge: 'bg-info text-info-foreground'
        };
    }
  };

  // Group alerts by patient
  const alertsByPatient = allAlerts.reduce((acc, alert: any) => {
    const patientName = alert.patientName || 'Unknown Patient';
    if (!acc[patientName]) {
      acc[patientName] = [];
    }
    acc[patientName].push(alert);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Patient Alerts</h1>
        <p className="text-muted-foreground">Monitor and manage health alerts for your patients</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-destructive/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
              <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold text-warning">{warningCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stable Patients</p>
              <p className="text-2xl font-bold text-success">
                {assignedPatients.length - criticalCount - warningCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            All Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allAlerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
              <p className="font-medium">All Clear</p>
              <p className="text-sm">No alerts from your patients</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(alertsByPatient).map(([patientName, alerts]) => (
                <div key={patientName} className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{patientName}</h3>
                  {alerts.slice(0, 3).map((alert: any) => {
                    const config = getSeverityConfig(alert.type);
                    const Icon = config.icon;
                    
                    return (
                      <div 
                        key={alert.id}
                        className={`${config.bg} border-l-4 ${config.border} p-4 rounded-lg`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 flex-shrink-0 ${config.text}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${config.badge} uppercase`}>
                                {alert.type}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            <p className={`text-sm font-medium ${config.text}`}>{alert.message}</p>
                            {alert.metric && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {alert.metric}: {alert.value}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAlertsSection;
