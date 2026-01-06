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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your vitals...</p>
        </div>
      </div>
    );
  }

  if (!vitals) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Device Connected</h2>
          <p className="text-gray-600">Please check your ESP8266 hardware connection.</p>
        </div>
      </div>
    );
  }

  const isNormal = (value: number, min: number, max: number) => {
    return value >= min && value <= max;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {userProfile?.profile?.name || 'Patient'}
              </h1>
              <p className="text-sm text-gray-600">Real-time Health Monitoring</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('current')}
              className={`pb-2 px-1 flex items-center gap-2 transition ${
                activeTab === 'current'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Current Vitals
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 px-1 flex items-center gap-2 transition ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              History & Trends
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-1 flex items-center gap-2 transition ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Overview
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Alert Banner */}
        {alerts?.active && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4 rounded-lg animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Alert: {alerts.severity}</p>
                <p className="text-red-700">{alerts.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Vitals Tab */}
        {activeTab === 'current' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Temperature */}
            <VitalCard
              icon={<Thermometer className="w-8 h-8" />}
              title="Temperature"
              value={vitals.temperature.toFixed(1)}
              unit="°C"
              normal={isNormal(vitals.temperature, 36, 37.5)}
            />

            {/* Heart Rate */}
            <VitalCard
              icon={<Heart className="w-8 h-8" />}
              title="Heart Rate"
              value={vitals.heartRate.toFixed(0)}
              unit="BPM"
              normal={isNormal(vitals.heartRate, 60, 100)}
            />

            {/* SpO2 */}
            <VitalCard
              icon={<Activity className="w-8 h-8" />}
              title="Blood Oxygen"
              value={vitals.spO2.toFixed(0)}
              unit="%"
              normal={vitals.spO2 >= 95}
            />

            {/* Glucose */}
            <VitalCard
              icon={<Droplets className="w-8 h-8 text-red-500" />}
              title="Glucose"
              value={vitals.glucose.toFixed(0)}
              unit="mg/dL"
              normal={isNormal(vitals.glucose, 70, 140)}
            />

            {/* Humidity */}
            <VitalCard
              icon={<Droplets className="w-8 h-8 text-blue-500" />}
              title="Humidity"
              value={vitals.humidity.toFixed(1)}
              unit="%"
              normal={true}
            />

            {/* Device Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Device Status</h3>
                {status?.deviceConnected ? (
                  <Wifi className="w-6 h-6 text-green-500" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-500" />
                )}
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
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {historyLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading historical data...</p>
              </div>
            ) : historicalData.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Historical Data Yet</h3>
                <p className="text-gray-600">Data will appear here as your device collects readings over time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VitalsChart 
                  data={historicalData}
                  dataKey="temperature"
                  title="Temperature Trend"
                  color="#ef4444"
                  unit="°C"
                />
                <VitalsChart 
                  data={historicalData}
                  dataKey="heartRate"
                  title="Heart Rate Trend"
                  color="#3b82f6"
                  unit="BPM"
                />
                <VitalsChart 
                  data={historicalData}
                  dataKey="glucose"
                  title="Glucose Trend"
                  color="#8b5cf6"
                  unit="mg/dL"
                />
                <VitalsChart 
                  data={historicalData}
                  dataKey="spO2"
                  title="Blood Oxygen Trend"
                  color="#10b981"
                  unit="%"
                />
              </div>
            )}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatsSummary patientId={userProfile?.patientId || ''} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertHistory patientId={userProfile?.patientId || ''} />
              <ExportData 
                patientId={userProfile?.patientId || ''} 
                patientName={userProfile?.profile?.name || 'Patient'}
              />
            </div>
          </div>
        )}
      </main>
    </div>
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
    <div className={`bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${
      !normal ? 'ring-2 ring-red-400' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={normal ? 'text-blue-600' : 'text-red-600'}>
          {icon}
        </div>
        {!normal && (
          <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
            ⚠️ Abnormal
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-bold ${normal ? 'text-gray-900' : 'text-red-600'}`}>
          {value}
        </span>
        <span className="text-lg text-gray-500">{unit}</span>
      </div>
    </div>
  );
};

interface StatusRowProps {
  label: string;
  value: string;
  status?: boolean;
}

const StatusRow: React.FC<StatusRowProps> = ({ label, value, status }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}:</span>
      <span className={`font-medium ${
        status ? 'text-green-600' : 'text-red-600'
      }`}>
        {value}
      </span>
    </div>
  );
};

export default PatientDashboard;
