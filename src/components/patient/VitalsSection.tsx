import React from 'react';
import { Thermometer, Heart, Wind, Droplets, Activity, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Vitals, DeviceStatus } from '@/types';

interface VitalsSectionProps {
  vitals: Vitals | null;
  status: DeviceStatus | null;
  isConnected: boolean;
  lastUpdated: Date | null;
}

interface VitalCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | undefined;
  unit: string;
  status: 'normal' | 'warning' | 'danger';
  color: string;
}

const VitalCard: React.FC<VitalCardProps> = ({ icon, title, value, unit, status, color }) => {
  const statusStyles = {
    normal: 'border-border',
    warning: 'border-warning ring-1 ring-warning/20',
    danger: 'border-destructive ring-2 ring-destructive/30',
  };

  const valueStyles = {
    normal: 'text-foreground',
    warning: 'text-warning',
    danger: 'text-destructive',
  };

  return (
    <Card className={`metric-card border ${statusStyles[status]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color}`}>
            {icon}
          </div>
          {status !== 'normal' && (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              status === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
            }`}>
              {status === 'danger' ? '⚠️ Critical' : '⚡ Warning'}
            </span>
          )}
          {status === 'normal' && (
            <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${valueStyles[status]}`}>
            {typeof value === 'number' ? value.toFixed(1) : '--'}
          </span>
          <span className="text-lg text-muted-foreground">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const getVitalStatus = (value: number | undefined, min: number, max: number, criticalMin?: number, criticalMax?: number): 'normal' | 'warning' | 'danger' => {
  if (value === undefined) return 'normal';
  if (criticalMin !== undefined && value < criticalMin) return 'danger';
  if (criticalMax !== undefined && value > criticalMax) return 'danger';
  if (value < min || value > max) return 'warning';
  return 'normal';
};

export const VitalsSection: React.FC<VitalsSectionProps> = ({ vitals, status, isConnected, lastUpdated }) => {
  if (!vitals) {
    return (
      <div className="bg-card rounded-xl p-8 text-center">
        <WifiOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Device Connected</h3>
        <p className="text-muted-foreground">Please check your IoT device connection</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Real-Time Vitals</h2>
          <p className="text-sm text-muted-foreground">Live data from your monitoring device</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">Offline</span>
            </>
          )}
          {lastUpdated && (
            <span className="text-xs text-muted-foreground ml-2">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <VitalCard
          icon={<Thermometer className="w-6 h-6 text-white" />}
          title="Temperature"
          value={vitals.temperature}
          unit="°C"
          status={getVitalStatus(vitals.temperature, 36, 37.5, 35, 39)}
          color="bg-gradient-to-br from-red-500 to-orange-500"
        />
        <VitalCard
          icon={<Heart className="w-6 h-6 text-white" />}
          title="Heart Rate"
          value={vitals.heartRate}
          unit="BPM"
          status={getVitalStatus(vitals.heartRate, 60, 100, 40, 140)}
          color="bg-gradient-to-br from-pink-500 to-rose-500"
        />
        <VitalCard
          icon={<Wind className="w-6 h-6 text-white" />}
          title="Blood Oxygen"
          value={vitals.spO2}
          unit="%"
          status={getVitalStatus(vitals.spO2, 95, 100, 90, undefined)}
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        <VitalCard
          icon={<Droplets className="w-6 h-6 text-white" />}
          title="Glucose"
          value={vitals.glucose}
          unit="mg/dL"
          status={getVitalStatus(vitals.glucose, 70, 140, 50, 200)}
          color="bg-gradient-to-br from-purple-500 to-indigo-500"
        />
        <VitalCard
          icon={<Activity className="w-6 h-6 text-white" />}
          title="Humidity"
          value={vitals.humidity}
          unit="%"
          status="normal"
          color="bg-gradient-to-br from-teal-500 to-green-500"
        />
      </div>

      {/* Device Status Bar */}
      <div className="bg-muted/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Device:</span>
            <span className={`font-medium ${isConnected ? 'text-success' : 'text-destructive'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">MAX30100:</span>
            <span className={`font-medium ${status?.max30100_online ? 'text-success' : 'text-destructive'}`}>
              {status?.max30100_online ? 'Online' : 'Offline'}
            </span>
          </div>
          {status?.rssi && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Signal:</span>
              <span className="font-medium text-foreground">{status.rssi} dBm</span>
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Last Update: <span className="font-medium text-foreground">
            {vitals.timestamp ? new Date(vitals.timestamp).toLocaleString() : 'Just now'}
          </span>
        </div>
      </div>
    </section>
  );
};

export default VitalsSection;
