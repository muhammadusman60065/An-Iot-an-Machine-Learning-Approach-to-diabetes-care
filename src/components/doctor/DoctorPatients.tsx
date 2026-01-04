import React, { useState } from 'react';
import { Users, User, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDoctorPatients, PatientFullData } from '@/hooks/useDoctorPatients';
import { UserData } from '@/lib/firebase';

interface DoctorPatientsProps {
  userData: UserData | null;
}

const VitalCard = ({ icon, title, value, unit }: { 
  icon: string; 
  title: string; 
  value: number | undefined; 
  unit: string;
}) => (
  <div className="bg-muted/50 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-muted-foreground text-sm">{title}</span>
    </div>
    <div className="text-2xl font-bold text-foreground">
      {typeof value === 'number' ? value.toFixed(1) : '--'}
      <span className="text-sm text-muted-foreground ml-1">{unit}</span>
    </div>
  </div>
);

const PatientDetailView: React.FC<{ patient: PatientFullData }> = ({ patient }) => {
  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{patient.name}</h2>
              <p className="text-muted-foreground">{patient.condition}</p>
            </div>
            <div className={`ml-auto px-4 py-2 rounded-full ${patient.isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {patient.isConnected ? '● Connected' : '● Offline'}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Age:</span>
              <span className="ml-2 font-medium">{patient.age}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Room:</span>
              <span className="ml-2 font-medium">{patient.roomNumber}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Update:</span>
              <span className="ml-2 font-medium">{patient.delaySeconds}s ago</span>
            </div>
            <div>
              <span className="text-muted-foreground">Risk Level:</span>
              <span className={`ml-2 font-medium ${
                patient.mlPrediction?.riskLevel === 'critical' ? 'text-red-600' :
                patient.mlPrediction?.riskLevel === 'high' ? 'text-orange-600' :
                'text-green-600'
              }`}>{patient.mlPrediction?.riskLevel || 'unknown'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <VitalCard icon="🌡️" title="Temperature" value={patient.vitals?.temperature} unit="°C" />
        <VitalCard icon="♥️" title="Heart Rate" value={patient.vitals?.heartRate} unit="BPM" />
        <VitalCard icon="🫁" title="SpO2" value={patient.vitals?.spo2} unit="%" />
        <VitalCard icon="🩸" title="Glucose" value={patient.vitals?.glucose} unit="mg/dL" />
        <VitalCard icon="💧" title="Humidity" value={patient.vitals?.humidity} unit="%" />
      </div>

      {/* Patient Alerts */}
      {patient.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patient.alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg ${
                  alert.type === 'critical' ? 'bg-red-50 border border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.metric}: {alert.value} • {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const DoctorPatients: React.FC<DoctorPatientsProps> = ({ userData }) => {
  const { assignedPatients, isLoading } = useDoctorPatients(userData);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = assignedPatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPatientData = assignedPatients.find(p => p.patientId === selectedPatient);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Patients</h1>
        <p className="text-muted-foreground">Monitor and manage your assigned patients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={18} />
                Patients ({assignedPatients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.patientId}
                    onClick={() => setSelectedPatient(patient.patientId)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedPatient === patient.patientId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${patient.isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="font-medium">{patient.name}</span>
                    </div>
                    <div className="text-sm opacity-75 mt-1">{patient.condition}</div>
                  </button>
                ))}
                {filteredPatients.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No patients found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Patient Details */}
        <div className="lg:col-span-3">
          {selectedPatientData ? (
            <PatientDetailView patient={selectedPatientData} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <User size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Select a patient to view their details and vitals</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;
