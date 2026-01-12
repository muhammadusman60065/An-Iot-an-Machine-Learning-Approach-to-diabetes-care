import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePatientVitals } from '../hooks/usePatientVitals';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { VitalsChart } from '../components/charts/VitalsChart';
import { AlertHistory } from '../components/AlertHistory';
import { StatsSummary } from '../components/StatsSummary';
import { ExportData } from '../components/ExportData';
import { 
  Thermometer, 
  Heart, 
  Activity, 
  Droplets, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  LogOut,
  BarChart3,
  Grid3x3,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PatientDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { vitals, status, alerts, loading } = usePatientVitals(userProfile?.patientId);
  const { data: historicalData, loading: historyLoading } = useHistoricalData(userProfile?.patientId);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'overview'>('current');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading your vitals...</p>
        </div>
      </motion.div>
    );
  }

  if (!vitals) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
            <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Device Connected</h2>
          <p className="text-gray-600">Please check your ESP8266 hardware connection.</p>
        </motion.div>
      </motion.div>
    );
  }

  const isNormal = (value: number, min: number, max: number) => {
    return value >= min && value <= max;
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.header 
        className="bg-white shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {userProfile?.profile?.name || 'Patient'}
              </h1>
              <p className="text-sm text-gray-600">Real-time Health Monitoring</p>
            </div>
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            {(['current', 'history', 'overview'] as const).map((tab) => {
              const icons = {
                current: Grid3x3,
                history: BarChart3,
                overview: PieChart,
              };
              const labels = {
                current: 'Current Vitals',
                history: 'History & Trends',
                overview: 'Overview',
              };
              const Icon = icons[tab];
              return (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 flex items-center gap-2 transition ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  {labels[tab]}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Banner */}
        <AnimatePresence>
          {alerts?.active && (
            <motion.div
              className="mb-6 bg-red-100 border-l-4 border-red-500 p-4 rounded-lg"
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
              }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <motion.div 
                className="flex items-center gap-3"
                animate={{ 
                  x: [0, -3, 3, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </motion.div>
                <div>
                  <p className="font-semibold text-red-800">Alert: {alerts.severity}</p>
                  <p className="text-red-700">{alerts.message}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Vitals Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'current' && (
            <motion.div
              key="current"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <VitalCard
                  icon={<Thermometer className="w-8 h-8" />}
                  title="Temperature"
                  value={vitals.temperature.toFixed(1)}
                  unit="°C"
                  normal={isNormal(vitals.temperature, 36, 37.5)}
                />
                <VitalCard
                  icon={<Heart className="w-8 h-8" />}
                  title="Heart Rate"
                  value={vitals.heartRate.toFixed(0)}
                  unit="BPM"
                  normal={isNormal(vitals.heartRate, 60, 100)}
                />
                <VitalCard
                  icon={<Activity className="w-8 h-8" />}
                  title="Blood Oxygen"
                  value={vitals.spO2.toFixed(0)}
                  unit="%"
                  normal={vitals.spO2 >= 95}
                />
                <VitalCard
                  icon={<Droplets className="w-8 h-8 text-red-500" />}
                  title="Glucose"
                  value={vitals.glucose.toFixed(0)}
                  unit="mg/dL"
                  normal={isNormal(vitals.glucose, 70, 140)}
                />
                <VitalCard
                  icon={<Droplets className="w-8 h-8 text-blue-500" />}
                  title="Humidity"
                  value={vitals.humidity.toFixed(1)}
                  unit="%"
                  normal={true}
                />
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Device Status</h3>
                    <motion.div
                      animate={status?.deviceConnected ? {
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {status?.deviceConnected ? (
                        <Wifi className="w-6 h-6 text-green-500" />
                      ) : (
                        <WifiOff className="w-6 h-6 text-red-500" />
                      )}
                    </motion.div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <StatusRow 
                      label="Connection" 
                      value={status?.deviceConnected ? 'Online' : 'Offline'}
                      status={status?.deviceConnected}
                    />
                    <StatusRow 
                      label="MAX30100" 
                      value={status?.max30100_online ? 'Active' : 'Inactive'}
                      status={status?.max30100_online}
                    />
                    <StatusRow 
                      label="Signal" 
                      value={`${status?.rssi || '--'} dBm`}
                      status={true}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                {historyLoading ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                    />
                    <p className="text-gray-600">Loading historical data...</p>
                  </motion.div>
                ) : historicalData.length === 0 ? (
                  <motion.div
                    className="bg-white rounded-xl shadow-lg p-12 text-center"
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
                      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Historical Data Yet</h3>
                    <p className="text-gray-600">Data will appear here as your device collects readings over time.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <VitalsChart 
                      data={historicalData as unknown as Array<{ timestamp: number; [key: string]: number | string }>}
                      dataKey="temperature"
                      title="Temperature Trend"
                      color="#ef4444"
                      unit="°C"
                    />
                    <VitalsChart 
                      data={historicalData as unknown as Array<{ timestamp: number; [key: string]: number | string }>}
                      dataKey="heartRate"
                      title="Heart Rate Trend"
                      color="#3b82f6"
                      unit="BPM"
                    />
                    <VitalsChart 
                      data={historicalData as unknown as Array<{ timestamp: number; [key: string]: number | string }>}
                      dataKey="glucose"
                      title="Glucose Trend"
                      color="#8b5cf6"
                      unit="mg/dL"
                    />
                    <VitalsChart 
                      data={historicalData as unknown as Array<{ timestamp: number; [key: string]: number | string }>}
                      dataKey="spO2"
                      title="Blood Oxygen Trend"
                      color="#10b981"
                      unit="%"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                <StatsSummary patientId={userProfile?.patientId || ''} />
                
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AlertHistory patientId={userProfile?.patientId || ''} />
                  <ExportData 
                    patientId={userProfile?.patientId || ''} 
                    patientName={userProfile?.profile?.name || 'Patient'}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

// Reusable Components
interface VitalCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  normal: boolean;
}

const VitalCard: React.FC<VitalCardProps> = ({ icon, title, value, unit, normal }) => {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${
        !normal ? 'ring-2 ring-red-400' : ''
      }`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div
          className={normal ? 'text-blue-600' : 'text-red-600'}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
        {!normal && (
          <motion.span
            className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            ⚠️ Abnormal
          </motion.span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <motion.div
        className="flex items-baseline gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className={`text-4xl font-bold ${normal ? 'text-gray-900' : 'text-red-600'}`}>
          {value}
        </span>
        <span className="text-lg text-gray-500">{unit}</span>
      </motion.div>
    </motion.div>
  );
};

interface StatusRowProps {
  label: string;
  value: string;
  status?: boolean;
}

const StatusRow: React.FC<StatusRowProps> = ({ label, value, status }) => {
  return (
    <motion.div
      className="flex justify-between items-center"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-gray-600">{label}:</span>
      <span className={`font-medium ${
        status ? 'text-green-600' : 'text-red-600'
      }`}>
        {value}
      </span>
    </motion.div>
  );
};

export default PatientDashboard;
