import React, { useState, useCallback } from 'react';
import { Users, Search, Thermometer, Heart, Wind, Droplets, AlertTriangle, Wifi, WifiOff, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDoctorPatients, PatientFullData } from '@/hooks/useDoctorPatients';
import { UserData } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import AddPatientByIdDialog from './AddPatientByIdDialog';

interface DoctorPatientsSectionProps {
  userData: UserData | null;
}

const VitalCard = ({ 
  icon: Icon, 
  title, 
  value, 
  unit,
  color,
}: { 
  icon: React.ElementType; 
  title: string; 
  value: string | number | undefined; 
  unit: string;
  color: string;
}) => (
  <div className="bg-muted/50 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-sm text-muted-foreground">{title}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-foreground">
        {typeof value === 'number' ? value.toFixed(1) : value || '--'}
      </span>
      <span className="text-sm text-muted-foreground">{unit}</span>
    </div>
  </div>
);

const PatientDetailView: React.FC<{ patient: PatientFullData }> = ({ patient }) => {
  const riskColors: Record<string, string> = {
    critical: 'bg-destructive text-destructive-foreground',
    high: 'bg-orange-500 text-white',
    medium: 'bg-warning text-warning-foreground',
    low: 'bg-success text-success-foreground',
  };

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{patient.name}</h2>
          <p className="text-muted-foreground">{patient.condition || 'No condition specified'}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-muted-foreground">Age: {patient.age || 'N/A'}</span>
            <span className="text-muted-foreground">Room: {patient.roomNumber || 'N/A'}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {patient.isConnected ? (
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
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
            riskColors[patient.mlPrediction?.riskLevel || 'low']
          }`}>
            {patient.mlPrediction?.riskLevel || 'unknown'} risk
          </span>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalCard
          icon={Thermometer}
          title="Temperature"
          value={patient.vitals?.temperature}
          unit="°C"
          color="text-red-500"
        />
        <VitalCard
          icon={Heart}
          title="Heart Rate"
          value={patient.vitals?.heartRate}
          unit="BPM"
          color="text-pink-500"
        />
        <VitalCard
          icon={Wind}
          title="SpO₂"
          value={patient.vitals?.spo2}
          unit="%"
          color="text-blue-500"
        />
        <VitalCard
          icon={Droplets}
          title="Glucose"
          value={patient.vitals?.glucose}
          unit="mg/dL"
          color="text-purple-500"
        />
      </div>

      {/* Last Update */}
      {patient.lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Last update: {new Date(patient.lastUpdated).toLocaleString()}
        </div>
      )}

      {/* Alerts */}
      {patient.alerts && patient.alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Patient Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patient.alerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'critical' ? 'bg-destructive/10 border-destructive' :
                    alert.type === 'warning' ? 'bg-warning/10 border-warning' :
                    'bg-info/10 border-info'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const DoctorPatientsSection: React.FC<DoctorPatientsSectionProps> = ({ userData }) => {
  const { assignedPatients, isLoading, refreshPatients } = useDoctorPatients(userData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientFullData | null>(null);

  const handlePatientAdded = useCallback(() => {
    // Refresh patient list when a new patient is added
    if (refreshPatients) {
      refreshPatients();
    }
  }, [refreshPatients]);

  const filteredPatients = assignedPatients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get array of patient IDs for the dialog
  const doctorPatientIds = assignedPatients.map(p => p.patientId);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Patients</h1>
          <p className="text-muted-foreground">View and monitor your assigned patients ({assignedPatients.length} patients)</p>
        </div>
        {userData && (
          <AddPatientByIdDialog 
            doctorUid={userData.uid} 
            doctorPatients={doctorPatientIds}
            onPatientAdded={handlePatientAdded} 
          />
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No patients found</p>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  key={patient.patientId}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedPatient?.patientId === patient.patientId
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card hover:bg-muted/50 border border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${patient.isConnected ? 'bg-success' : 'bg-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{patient.name}</p>
                      <p className={`text-sm truncate ${
                        selectedPatient?.patientId === patient.patientId ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {patient.condition || 'No condition'}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${
                      selectedPatient?.patientId === patient.patientId ? 'text-primary-foreground' : ''
                    }`}>
                      {patient.vitals?.heartRate?.toFixed(0) || '--'} BPM
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Patient Detail */}
        <div className="lg:col-span-2">
          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              {selectedPatient ? (
                <PatientDetailView patient={selectedPatient} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
                  <Users className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Select a patient</p>
                  <p className="text-sm">Click on a patient to view their details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientsSection;
