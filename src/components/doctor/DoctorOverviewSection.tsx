import React from 'react';
import { Users, AlertTriangle, Activity, Wifi, Heart, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoctorPatients, PatientFullData } from '@/hooks/useDoctorPatients';
import { UserData } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface DoctorOverviewSectionProps {
  userData: UserData | null;
}

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  color,
  subtext,
}: { 
  icon: React.ElementType; 
  title: string; 
  value: string | number; 
  color: string;
  subtext?: string;
}) => (
  <Card className="metric-card">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
);

const PatientVitalRow: React.FC<{ patient: PatientFullData }> = ({ patient }) => {
  const riskColors: Record<string, string> = {
    critical: 'bg-destructive/10 text-destructive',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-success/10 text-success',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${patient.isConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
        <div>
          <p className="font-semibold text-foreground">{patient.name}</p>
          <p className="text-sm text-muted-foreground">{patient.condition || 'No condition specified'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Temperature */}
        <div className="text-center hidden md:block">
          <div className="flex items-center gap-1 text-red-500">
            <Thermometer className="w-4 h-4" />
            <span className="font-semibold">{patient.vitals?.temperature?.toFixed(1) || '--'}</span>
          </div>
          <span className="text-xs text-muted-foreground">°C</span>
        </div>
        
        {/* Heart Rate */}
        <div className="text-center">
          <div className="flex items-center gap-1 text-pink-500">
            <Heart className="w-4 h-4" />
            <span className="font-semibold">{patient.vitals?.heartRate?.toFixed(0) || '--'}</span>
          </div>
          <span className="text-xs text-muted-foreground">BPM</span>
        </div>
        
        {/* Glucose */}
        <div className="text-center hidden sm:block">
          <span className="font-semibold text-purple-500">
            {patient.vitals?.glucose?.toFixed(0) || '--'}
          </span>
          <p className="text-xs text-muted-foreground">mg/dL</p>
        </div>

        {/* Risk Level */}
        <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
          riskColors[patient.mlPrediction?.riskLevel || 'low']
        }`}>
          {patient.mlPrediction?.riskLevel || 'unknown'}
        </div>
      </div>
    </div>
  );
};

const DoctorOverviewSection: React.FC<DoctorOverviewSectionProps> = ({ userData }) => {
  const { assignedPatients, criticalCount, warningCount, isLoading } = useDoctorPatients(userData);

  const connectedPatients = assignedPatients.filter(p => p.isConnected).length;
  const avgHeartRate = assignedPatients.length > 0
    ? Math.round(assignedPatients.reduce((sum, p) => sum + (p.vitals?.heartRate || 0), 0) / assignedPatients.length)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, Dr. {userData?.name || 'Doctor'}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Patients"
          value={assignedPatients.length}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtext="Assigned to you"
        />
        <StatCard
          icon={Wifi}
          title="Connected Devices"
          value={connectedPatients}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtext="Currently online"
        />
        <StatCard
          icon={AlertTriangle}
          title="Critical Alerts"
          value={criticalCount}
          color="bg-gradient-to-br from-red-500 to-red-600"
          subtext={warningCount > 0 ? `+ ${warningCount} warnings` : 'No warnings'}
        />
        <StatCard
          icon={Activity}
          title="Avg Heart Rate"
          value={`${avgHeartRate}`}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subtext="Across all patients"
        />
      </div>

      {/* Patient Status Overview - Real-Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Patient Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignedPatients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No patients assigned</p>
                <p className="text-sm">Contact admin to get patients assigned to you</p>
              </div>
            ) : (
              assignedPatients.map((patient) => (
                <PatientVitalRow key={patient.patientId} patient={patient} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorOverviewSection;
