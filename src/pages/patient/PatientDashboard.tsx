import React from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientVitals } from "@/hooks/usePatientVitals";

// VitalCard Component
const VitalCard = ({ 
  icon, 
  title, 
  value, 
  unit, 
  normal = true 
}: { 
  icon: string; 
  title: string; 
  value: number | undefined; 
  unit: string; 
  normal?: boolean;
}) => {
  return (
    <div className={`bg-card rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${!normal ? 'ring-2 ring-destructive' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        {!normal && <span className="text-destructive text-sm font-medium">⚠️ Abnormal</span>}
      </div>
      <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline">
        <span className={`text-4xl font-bold ${normal ? 'text-foreground' : 'text-destructive'}`}>
          {typeof value === 'number' ? value.toFixed(1) : value || '--'}
        </span>
        <span className="text-muted-foreground text-lg ml-2">{unit}</span>
      </div>
    </div>
  );
};

const PatientDashboard = () => {
  const { userData } = useAuth();
  
  // Get patientId from userData - use email prefix as patientId
  const patientId = userData?.patientId || 
    (userData?.role === "patient" && userData.email 
      ? userData.email.split("@")[0] 
      : null);
  
  const { vitals, status, alerts, loading } = usePatientVitals(patientId);

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-xl text-muted-foreground">Loading your vitals...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vitals) {
    return (
      <DashboardLayout role="patient">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-xl text-muted-foreground">No device connected. Please check your hardware.</div>
          <div className="text-sm text-muted-foreground">
            Firebase Path: <code className="bg-muted px-2 py-1 rounded">patients/{patientId}/vitals</code>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient">
      <div className="min-h-screen p-6 space-y-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {userData?.name || "Patient"}
          </h1>
          <p className="text-muted-foreground">Real-time health monitoring</p>
          <p className="text-xs text-muted-foreground mt-1">
            Firebase Path: <code className="bg-muted px-2 py-1 rounded">patients/{patientId}/vitals</code>
          </p>
        </div>

        {/* Alert Banner */}
        {alerts?.active && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-destructive font-medium">
                    🚨 Alert: {alerts.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vitals Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Temperature Card */}
          <VitalCard
            icon="🌡️"
            title="Temperature"
            value={vitals.temperature}
            unit="°C"
            normal={vitals.temperature >= 36 && vitals.temperature <= 37.5}
          />

          {/* Heart Rate Card */}
          <VitalCard
            icon="♥️"
            title="Heart Rate"
            value={vitals.heartRate}
            unit="BPM"
            normal={vitals.heartRate >= 60 && vitals.heartRate <= 100}
          />

          {/* SpO2 Card */}
          <VitalCard
            icon="🫁"
            title="Blood Oxygen"
            value={vitals.spO2}
            unit="%"
            normal={vitals.spO2 >= 95}
          />

          {/* Glucose Card */}
          <VitalCard
            icon="🩸"
            title="Glucose"
            value={vitals.glucose}
            unit="mg/dL"
            normal={vitals.glucose >= 70 && vitals.glucose <= 140}
          />

          {/* Humidity Card */}
          <VitalCard
            icon="💧"
            title="Humidity"
            value={vitals.humidity}
            unit="%"
            normal={true}
          />

          {/* Device Status Card */}
          <div className="bg-card rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Device Status</h3>
              <div className={`w-3 h-3 rounded-full ${vitals ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connection:</span>
                <span className={vitals ? 'text-success font-medium' : 'text-destructive font-medium'}>
                  {vitals ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MAX30100:</span>
                <span className={status?.max30100_online !== false ? 'text-success font-medium' : 'text-destructive font-medium'}>
                  {status?.max30100_online !== false ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span className="text-foreground font-medium">{vitals?.timestamp ? new Date(vitals.timestamp).toLocaleTimeString() : status?.lastUpdate || 'Live'}</span>
              </div>
              {status?.rssi && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signal:</span>
                  <span className="text-foreground font-medium">{status.rssi} dBm</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
