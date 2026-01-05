import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePatientVitals } from '../hooks/usePatientVitals';
import { LogOut, Wifi, WifiOff, AlertTriangle, Loader2, Thermometer, Heart, Activity, Droplets, Signal } from 'lucide-react';

interface VitalCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  isNormal: boolean;
  emoji: string;
}

const VitalCard: React.FC<VitalCardProps> = ({ title, value, unit, icon, isNormal, emoji }) => (
  <div
    className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${
      isNormal
        ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200'
        : 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 animate-pulse'
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{emoji}</span>
      <div className={`p-2 rounded-full ${isNormal ? 'bg-green-200' : 'bg-red-200'}`}>
        {icon}
      </div>
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <div className="flex items-baseline gap-1">
      <span className={`text-3xl font-bold ${isNormal ? 'text-green-700' : 'text-red-700'}`}>
        {value}
      </span>
      <span className="text-sm text-gray-500">{unit}</span>
    </div>
    <div className={`mt-2 text-xs font-medium ${isNormal ? 'text-green-600' : 'text-red-600'}`}>
      {isNormal ? '✓ Normal' : '⚠ Abnormal'}
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="p-6 rounded-xl bg-gray-100 animate-pulse">
        <div className="h-8 w-8 bg-gray-200 rounded-full mb-4" />
        <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-8 w-16 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-16">
    <WifiOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Device Connected</h3>
    <p className="text-gray-500">Please connect your monitoring device to see vital signs.</p>
  </div>
);

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { vitals, status, alerts, loading } = usePatientVitals(userProfile?.patientId);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Check if values are in normal range
  const isTemperatureNormal = vitals ? vitals.temperature >= 36 && vitals.temperature <= 37.5 : true;
  const isHeartRateNormal = vitals ? vitals.heartRate >= 60 && vitals.heartRate <= 100 : true;
  const isSpO2Normal = vitals ? vitals.spO2 >= 95 : true;
  const isGlucoseNormal = vitals ? vitals.glucose >= 70 && vitals.glucose <= 140 : true;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userProfile?.profile?.name || 'Patient'}!</h1>
            <p className="text-white/80 text-sm">Your health dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Alert Banner */}
        {alerts?.active && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3 animate-pulse">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Health Alert</p>
              <p className="text-red-700">{alerts.message}</p>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : !vitals ? (
          <EmptyState />
        ) : (
          <>
            {/* Vitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <VitalCard
                title="Temperature"
                value={vitals.temperature?.toFixed(1) || '--'}
                unit="°C"
                emoji="🌡️"
                icon={<Thermometer className="h-5 w-5 text-gray-600" />}
                isNormal={isTemperatureNormal}
              />
              <VitalCard
                title="Heart Rate"
                value={vitals.heartRate || '--'}
                unit="BPM"
                emoji="❤️"
                icon={<Heart className="h-5 w-5 text-gray-600" />}
                isNormal={isHeartRateNormal}
              />
              <VitalCard
                title="Blood Oxygen (SpO2)"
                value={vitals.spO2 || '--'}
                unit="%"
                emoji="🫁"
                icon={<Activity className="h-5 w-5 text-gray-600" />}
                isNormal={isSpO2Normal}
              />
              <VitalCard
                title="Blood Glucose"
                value={vitals.glucose || '--'}
                unit="mg/dL"
                emoji="🩸"
                icon={<Droplets className="h-5 w-5 text-gray-600" />}
                isNormal={isGlucoseNormal}
              />
              <VitalCard
                title="Humidity"
                value={vitals.humidity?.toFixed(1) || '--'}
                unit="%"
                emoji="💧"
                icon={<Droplets className="h-5 w-5 text-gray-600" />}
                isNormal={true}
              />

              {/* Device Status Card */}
              <div
                className={`p-6 rounded-xl shadow-lg ${
                  status?.deviceConnected
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">📡</span>
                  <div className={`p-2 rounded-full ${status?.deviceConnected ? 'bg-blue-200' : 'bg-gray-200'}`}>
                    {status?.deviceConnected ? (
                      <Wifi className="h-5 w-5 text-blue-600" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Device Status</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${status?.deviceConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">{status?.deviceConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Signal className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">RSSI: {status?.rssi || '--'} dBm</span>
                  </div>
                  {status?.lastUpdate && (
                    <p className="text-xs text-gray-400 mt-2">
                      Last update: {new Date(status.lastUpdate).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Timestamp */}
            {vitals.timestamp && (
              <div className="text-center text-sm text-gray-500">
                Last reading: {new Date(vitals.timestamp).toLocaleString()}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
