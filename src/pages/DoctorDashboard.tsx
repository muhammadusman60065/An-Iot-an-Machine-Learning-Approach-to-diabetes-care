import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePatientVitals } from '../hooks/usePatientVitals';
import { database } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { UserProfile } from '../types';
import { 
  LogOut, 
  User, 
  Thermometer, 
  Heart, 
  Activity, 
  Droplets,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { vitals, status, alerts } = usePatientVitals(selectedPatientId || undefined);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!userProfile?.assignedPatients) {
        setLoading(false);
        return;
      }

      try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
          const allUsers = snapshot.val();
          const patientProfiles: UserProfile[] = [];

          Object.entries(allUsers).forEach(([uid, userData]: [string, any]) => {
            if (
              userData.role === 'patient' && 
              userProfile.assignedPatients?.includes(userData.patientId)
            ) {
              patientProfiles.push({
                uid,
                ...userData
              });
            }
          });

          setPatients(patientProfiles);
          if (patientProfiles.length > 0) {
            setSelectedPatientId(patientProfiles[0].patientId);
          }
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [userProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    setSidebarOpen(false);
  };

  const selectedPatient = patients.find(p => p.patientId === selectedPatientId);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 bg-background shadow-lg p-6 overflow-y-auto
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-6 mt-12 lg:mt-0">
          <h2 className="text-xl font-bold text-foreground mb-1">
            Dr. {userProfile?.profile?.name}
          </h2>
          <p className="text-sm text-muted-foreground">{userProfile?.profile?.specialization}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Your Patients ({patients.length})
          </h3>
          {patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No patients assigned</p>
            </div>
          ) : (
            <div className="space-y-2">
              {patients.map((patient) => (
                <button
                  key={patient.patientId}
                  onClick={() => handlePatientSelect(patient.patientId!)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedPatientId === patient.patientId
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted hover:bg-accent text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">{patient.profile?.name}</p>
                      <p className="text-sm opacity-75">{patient.patientId}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto pt-16 lg:pt-8">
        {selectedPatient ? (
          <>
            {/* Patient Header */}
            <div className="bg-background rounded-xl shadow-lg p-6 mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {selectedPatient.profile?.name}
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <InfoItem label="Age" value={selectedPatient.profile?.age} />
                <InfoItem label="Gender" value={selectedPatient.profile?.gender} />
                <InfoItem label="Condition" value={selectedPatient.profile?.condition} />
                <InfoItem 
                  label="Device" 
                  value={status?.deviceConnected ? '🟢 Online' : '🔴 Offline'} 
                />
              </div>
            </div>

            {/* Alert */}
            {alerts?.active && (
              <div className="mb-6 bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">🚨 Alert: {alerts.severity}</p>
                    <p className="text-destructive/80">{alerts.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Vitals Grid */}
            {vitals ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <VitalCard
                  icon={<Thermometer className="w-6 h-6" />}
                  title="Temperature"
                  value={vitals.temperature.toFixed(1)}
                  unit="°C"
                  normal={vitals.temperature >= 36 && vitals.temperature <= 37.5}
                />
                <VitalCard
                  icon={<Heart className="w-6 h-6" />}
                  title="Heart Rate"
                  value={vitals.heartRate.toFixed(0)}
                  unit="BPM"
                  normal={vitals.heartRate >= 60 && vitals.heartRate <= 100}
                />
                <VitalCard
                  icon={<Activity className="w-6 h-6" />}
                  title="SpO2"
                  value={vitals.spO2.toFixed(0)}
                  unit="%"
                  normal={vitals.spO2 >= 95}
                />
                <VitalCard
                  icon={<Droplets className="w-6 h-6 text-red-500" />}
                  title="Glucose"
                  value={vitals.glucose.toFixed(0)}
                  unit="mg/dL"
                  normal={vitals.glucose >= 70 && vitals.glucose <= 140}
                />
                <VitalCard
                  icon={<Droplets className="w-6 h-6 text-blue-500" />}
                  title="Humidity"
                  value={vitals.humidity.toFixed(1)}
                  unit="%"
                  normal={true}
                />
              </div>
            ) : (
              <div className="bg-background rounded-xl shadow-lg p-8 text-center text-muted-foreground">
                No data available for this patient
              </div>
            )}
          </>
        ) : (
          <div className="bg-background rounded-xl shadow-lg p-8 text-center text-muted-foreground">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">Select a patient to view their vitals</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Helper Components
const InfoItem: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div>
    <p className="text-muted-foreground">{label}</p>
    <p className="font-semibold text-foreground">{value || '--'}</p>
  </div>
);

interface VitalCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  normal?: boolean;
}

const VitalCard: React.FC<VitalCardProps> = ({ icon, title, value, unit, normal = true }) => (
  <div className={`bg-background rounded-xl shadow p-6 transition-all hover:shadow-lg ${
    !normal ? 'ring-2 ring-destructive' : ''
  }`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`flex items-center gap-3 ${normal ? 'text-primary' : 'text-destructive'}`}>
        {icon}
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
      </div>
      {!normal && (
        <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded">
          ⚠️ Abnormal
        </span>
      )}
    </div>
    <div className="flex items-baseline gap-2">
      <span className={`text-3xl font-bold ${normal ? 'text-foreground' : 'text-destructive'}`}>
        {value}
      </span>
      <span className="text-lg text-muted-foreground">{unit}</span>
    </div>
  </div>
);
