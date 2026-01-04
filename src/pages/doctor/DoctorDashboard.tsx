import React, { useState, useEffect } from 'react';
import { Users, Loader2, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { database, ref, get, getDoctorAssignments, UserData } from "@/lib/firebase";
import { usePatientVitals, Vitals, DeviceStatus, PatientAlerts } from "@/hooks/usePatientVitals";
import DiabetesChatbot from "@/components/chatbot/DiabetesChatbot";

interface PatientProfile {
  uid: string;
  patientId: string;
  profile?: {
    name?: string;
    age?: number;
    gender?: string;
    condition?: string;
  };
}

// VitalCard Component
const VitalCard = ({ icon, title, value, unit }: { 
  icon: string; 
  title: string; 
  value: number | undefined; 
  unit: string;
}) => (
  <div className="bg-card rounded-xl shadow p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-muted-foreground text-sm">{title}</span>
    </div>
    <div className="text-3xl font-bold text-foreground">
      {typeof value === 'number' ? value.toFixed(1) : '--'}
      <span className="text-lg text-muted-foreground ml-1">{unit}</span>
    </div>
  </div>
);

// Component to show selected patient's vitals
const PatientVitalsView = ({ 
  patientId, 
  patient 
}: { 
  patientId: string; 
  patient: PatientProfile | null;
}) => {
  const { vitals, status, alerts } = usePatientVitals(patientId);

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <div className="bg-card rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{patient?.profile?.name || 'Unknown Patient'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Age:</span>
            <span className="ml-2 font-medium">{patient?.profile?.age || '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Gender:</span>
            <span className="ml-2 font-medium">{patient?.profile?.gender || '--'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Condition:</span>
            <span className="ml-2 font-medium">{patient?.profile?.condition || 'Diabetes Monitoring'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Device:</span>
            <span className={`ml-2 font-medium ${status?.deviceConnected ? 'text-success' : 'text-destructive'}`}>
              {status?.deviceConnected ? '● Online' : '● Offline'}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Firebase Path: <code className="bg-muted px-2 py-1 rounded">patients/{patientId}/vitals</code>
        </p>
      </div>

      {/* Alert */}
      {alerts?.active && (
        <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg">
          <p className="text-destructive font-medium">🚨 {alerts.message}</p>
        </div>
      )}

      {/* Vitals Grid */}
      {vitals ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VitalCard icon="🌡️" title="Temperature" value={vitals.temperature} unit="°C" />
          <VitalCard icon="♥️" title="Heart Rate" value={vitals.heartRate} unit="BPM" />
          <VitalCard icon="🫁" title="SpO2" value={vitals.spO2} unit="%" />
          <VitalCard icon="🩸" title="Glucose" value={vitals.glucose} unit="mg/dL" />
          <VitalCard icon="💧" title="Humidity" value={vitals.humidity} unit="%" />
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-lg p-8 text-center text-muted-foreground">
          No vitals data available for this patient
        </div>
      )}
    </div>
  );
};

const DoctorDashboard = () => {
  const { userData } = useAuth();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!userData?.uid) return;

      try {
        // Get assigned patient IDs
        const assignedPatientIds = userData.assignedPatients || await getDoctorAssignments(userData.uid);
        
        if (!assignedPatientIds || assignedPatientIds.length === 0) {
          setLoading(false);
          return;
        }

        const patientPromises = assignedPatientIds.map(async (patientId: string) => {
          // Fetch patient profile from users collection
          const usersRef = ref(database, 'users');
          const usersSnapshot = await get(usersRef);
          
          let patientProfile: PatientProfile | null = null;
          
          if (usersSnapshot.exists()) {
            usersSnapshot.forEach((userSnap: any) => {
              const userData = userSnap.val();
              if (userData.patientId === patientId || userSnap.key === patientId) {
                patientProfile = {
                  uid: userSnap.key,
                  patientId: userData.patientId || patientId,
                  profile: {
                    name: userData.name,
                    age: userData.age,
                    gender: userData.gender,
                    condition: userData.condition || 'Diabetes Monitoring',
                  }
                };
              }
            });
          }

          // If no user profile found, create a basic one
          if (!patientProfile) {
            patientProfile = {
              uid: patientId,
              patientId,
              profile: {
                name: `Patient ${patientId}`,
                condition: 'Diabetes Monitoring',
              }
            };
          }

          return patientProfile;
        });

        const patientsData = await Promise.all(patientPromises);
        const validPatients = patientsData.filter((p): p is PatientProfile => p !== null);
        
        setPatients(validPatients);
        
        if (validPatients.length > 0) {
          setSelectedPatient(validPatients[0].patientId);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setLoading(false);
      }
    };

    fetchPatients();
  }, [userData]);

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading patients...</span>
        </div>
      </DashboardLayout>
    );
  }

  const selectedPatientData = patients.find(p => p.patientId === selectedPatient) || null;

  return (
    <DashboardLayout role="doctor">
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Dr. {userData?.name || "Doctor"} - Patient Monitor
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl shadow-lg p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users size={18} />
                  Your Patients
                </h2>
                <div className="space-y-2">
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <button
                        key={patient.patientId}
                        onClick={() => setSelectedPatient(patient.patientId)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedPatient === patient.patientId
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <div className="font-medium">{patient.profile?.name || 'Unknown'}</div>
                        <div className="text-sm opacity-75">{patient.patientId}</div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No patients assigned
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Patient Vitals */}
            <div className="lg:col-span-3">
              {selectedPatient ? (
                <PatientVitalsView 
                  patientId={selectedPatient} 
                  patient={selectedPatientData}
                />
              ) : (
                <div className="bg-card rounded-xl shadow-lg p-8 text-center text-muted-foreground">
                  <User size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a patient to view their vitals</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <DiabetesChatbot />
    </DashboardLayout>
  );
};

export default DoctorDashboard;
