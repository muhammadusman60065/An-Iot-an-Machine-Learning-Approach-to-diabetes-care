import React from 'react';
import { Users, AlertTriangle, Activity, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoctorPatients, PatientFullData } from '@/hooks/useDoctorPatients';
import { UserData } from '@/lib/firebase';

interface DoctorOverviewProps {
  userData: UserData | null;
}

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  title: string; 
  value: string | number; 
  color: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const DoctorOverview: React.FC<DoctorOverviewProps> = ({ userData }) => {
  const { assignedPatients, criticalCount, warningCount, isLoading } = useDoctorPatients(userData);

  const connectedPatients = assignedPatients.filter(p => p.isConnected).length;
  const avgHeartRate = assignedPatients.length > 0
    ? Math.round(assignedPatients.reduce((sum, p) => sum + (p.vitals?.heartRate || 0), 0) / assignedPatients.length)
    : 0;

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
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, Dr. {userData?.name || 'Doctor'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Patients"
          value={assignedPatients.length}
          color="bg-blue-500"
        />
        <StatCard
          icon={Activity}
          title="Connected Devices"
          value={connectedPatients}
          color="bg-green-500"
        />
        <StatCard
          icon={AlertTriangle}
          title="Critical Alerts"
          value={criticalCount}
          color="bg-red-500"
        />
        <StatCard
          icon={Calendar}
          title="Avg Heart Rate"
          value={`${avgHeartRate} BPM`}
          color="bg-purple-500"
        />
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedPatients.slice(0, 5).map((patient) => (
              <div key={patient.patientId} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${patient.isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">{patient.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {patient.vitals?.heartRate || '--'} BPM
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Glucose: {patient.vitals?.glucose || '--'} mg/dL
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  patient.mlPrediction?.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                  patient.mlPrediction?.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                  patient.mlPrediction?.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {patient.mlPrediction?.riskLevel || 'unknown'} risk
                </div>
              </div>
            ))}
            {assignedPatients.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No patients assigned</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorOverview;
