import React from 'react';
import { AlertTriangle, Bell, CheckCircle, Info, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/types';
import { AlertHistoryItem } from '@/hooks/usePatientDashboard';
import { formatDistanceToNow } from 'date-fns';

interface AlertsSectionProps {
  currentAlert: Alert | null;
  alertHistory: AlertHistoryItem[];
}

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return { 
        icon: AlertTriangle, 
        bg: 'bg-destructive/10', 
        border: 'border-destructive', 
        text: 'text-destructive',
        badge: 'bg-destructive text-destructive-foreground'
      };
    case 'HIGH':
      return { 
        icon: AlertTriangle, 
        bg: 'bg-orange-500/10', 
        border: 'border-orange-500', 
        text: 'text-orange-600',
        badge: 'bg-orange-500 text-white'
      };
    case 'MEDIUM':
      return { 
        icon: Info, 
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

export const AlertsSection: React.FC<AlertsSectionProps> = ({ currentAlert, alertHistory }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Alerts</h2>
          <p className="text-sm text-muted-foreground">Health notifications and warnings</p>
        </div>
      </div>

      {/* Current Active Alert */}
      {currentAlert?.active && (
        <div className={`${getSeverityConfig(currentAlert.severity).bg} border-l-4 ${getSeverityConfig(currentAlert.severity).border} p-4 rounded-lg animate-pulse`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${getSeverityConfig(currentAlert.severity).text}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${getSeverityConfig(currentAlert.severity).text}`}>
                  🚨 ACTIVE ALERT
                </span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getSeverityConfig(currentAlert.severity).badge}`}>
                  {currentAlert.severity}
                </span>
              </div>
              <p className={`text-sm font-medium ${getSeverityConfig(currentAlert.severity).text}`}>
                {currentAlert.message}
              </p>
              {currentAlert.timestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(currentAlert.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Alert History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertHistory.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-foreground font-medium">All Clear</p>
              <p className="text-sm text-muted-foreground">No alerts recorded</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {alertHistory.map((alert) => {
                const config = getSeverityConfig(alert.severity);
                const Icon = config.icon;
                
                return (
                  <div 
                    key={alert.id}
                    className={`${config.bg} border-l-4 ${config.border} p-3 rounded-lg transition-all hover:shadow-sm`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.text}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-xs font-semibold ${config.text} uppercase`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(alert.timestamp * 1000), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-sm ${config.text} break-words`}>{alert.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default AlertsSection;
