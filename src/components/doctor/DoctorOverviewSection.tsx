import React from 'react';
import { Users, AlertTriangle, Activity, Wifi, Heart, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoctorPatients, PatientFullData } from '@/hooks/useDoctorPatients';
import { UserData } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
  >
    <Card className="metric-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <motion.div 
            className={`p-3 rounded-xl ${color}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const PatientVitalRow: React.FC<{ patient: PatientFullData }> = ({ patient }) => {
  const riskColors: Record<string, string> = {
    critical: 'bg-destructive/10 text-destructive',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-success/10 text-success',
  };

  return (
    <motion.div 
      className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 5, scale: 1.01 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="flex items-center gap-4">
        <motion.div 
          className={`w-3 h-3 rounded-full ${patient.isConnected ? 'bg-success' : 'bg-muted-foreground'}`}
          animate={patient.isConnected ? {
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
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
        <motion.div 
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
            riskColors[patient.mlPrediction?.riskLevel || 'low']
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {patient.mlPrediction?.riskLevel || 'unknown'}
        </motion.div>
      </div>
    </motion.div>
  );
};

const DoctorOverviewSection: React.FC<DoctorOverviewSectionProps> = ({ userData }) => {
  const { assignedPatients, criticalCount, warningCount, isLoading } = useDoctorPatients(userData);

  const connectedPatients = assignedPatients.filter(p => p.isConnected).length;
  const avgHeartRate = assignedPatients.length > 0
    ? Math.round(assignedPatients.reduce((sum, p) => sum + (p.vitals?.heartRate || 0), 0) / assignedPatients.length)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (isLoading) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-[40vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, Dr. {userData?.name || 'Doctor'}</p>
      </motion.header>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
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
      </motion.div>

      {/* Patient Status Overview - Real-Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          whileHover={{ y: -5, scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Activity className="w-5 h-5 text-primary" />
                </motion.div>
                Live Patient Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {assignedPatients.length === 0 ? (
                  <motion.div 
                    className="text-center py-12 text-muted-foreground"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    </motion.div>
                    <p className="font-medium">No patients assigned</p>
                    <p className="text-sm">Contact admin to get patients assigned to you</p>
                  </motion.div>
                ) : (
                  assignedPatients.map((patient, index) => (
                    <motion.div
                      key={patient.patientId}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                    >
                      <PatientVitalRow patient={patient} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DoctorOverviewSection;
