import React from 'react';
import { Thermometer, Heart, Wind, Droplets, Activity, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Vitals, DeviceStatus } from '@/types';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
    >
      <Card className={`metric-card border ${statusStyles[status]}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className={`p-3 rounded-xl ${color}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
            {status !== 'normal' && (
              <motion.span 
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  status === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {status === 'danger' ? '⚠️ Critical' : '⚡ Warning'}
              </motion.span>
            )}
            {status === 'normal' && (
              <motion.div 
                className="w-3 h-3 rounded-full bg-success"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <motion.div 
            className="flex items-baseline gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className={`text-4xl font-bold ${valueStyles[status]}`}>
              {typeof value === 'number' ? value.toFixed(1) : '--'}
            </span>
            <span className="text-lg text-muted-foreground">{unit}</span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (!vitals) {
    return (
      <motion.div 
        className="bg-card rounded-xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <WifiOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        </motion.div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Device Connected</h3>
        <p className="text-muted-foreground">Please check your IoT device connection</p>
      </motion.div>
    );
  }

  return (
    <motion.section 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h2 className="text-xl font-bold text-foreground">Real-Time Vitals</h2>
          <p className="text-sm text-muted-foreground">Live data from your monitoring device</p>
        </div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isConnected ? (
            <>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Wifi className="w-5 h-5 text-success" />
              </motion.div>
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
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
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
      </motion.div>

      {/* Device Status Bar */}
      <motion.div 
        className="bg-muted/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
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
      </motion.div>
    </motion.section>
  );
};

export default VitalsSection;
