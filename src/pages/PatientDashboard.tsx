import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePatientVitals } from '../hooks/usePatientVitals';
import { 
  Thermometer, 
  Heart, 
  Activity, 
  Droplets, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  LogOut
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { vitals, status, alerts, loading } = usePatientVitals(userProfile?.patientId);
  const navigate = useNavigate();

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {userProfile?.profile.name}
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

        {/* Vitals Grid */}
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
