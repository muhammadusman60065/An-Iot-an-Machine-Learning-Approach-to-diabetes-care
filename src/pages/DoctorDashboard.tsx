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
import { motion, AnimatePresence } from 'framer-motion';

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

          Object.entries(allUsers).forEach(([uid, userData]) => {
            const user = userData as UserProfile & { role?: string; patientId?: string };
            if (
              user.role === 'patient' && 
              userProfile.assignedPatients?.includes(user.patientId || '')
            ) {
              patientProfiles.push({
                uid,
                ...user
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen bg-muted flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"
          />
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-muted flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-lg shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {sidebarOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 bg-background shadow-lg p-6 overflow-y-auto
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : (window.innerWidth >= 1024 ? 0 : -320),
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div 
          className="mb-6 mt-12 lg:mt-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-foreground mb-1">
            Dr. {userProfile?.profile?.name}
          </h2>
          <p className="text-sm text-muted-foreground">{userProfile?.profile?.specialization}</p>
        </motion.div>

        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Your Patients ({patients.length})
          </h3>
          {patients.length === 0 ? (
            <motion.div 
              className="text-center py-8 text-muted-foreground"
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
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              </motion.div>
              <p>No patients assigned</p>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {patients.map((patient, index) => (
                <motion.button
                  key={patient.patientId}
                  onClick={() => handlePatientSelect(patient.patientId!)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedPatientId === patient.patientId
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted hover:bg-accent text-foreground'
                  }`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={selectedPatientId === patient.patientId ? {
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <User className="w-5 h-5" />
                    </motion.div>
                    <div>
                      <p className="font-semibold">{patient.profile?.name}</p>
                      <p className="text-sm opacity-75">{patient.patientId}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        className="flex-1 p-4 lg:p-8 overflow-y-auto pt-16 lg:pt-8"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {selectedPatient ? (
            <motion.div
              key={selectedPatientId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Patient Header */}
              <motion.div 
                className="bg-background rounded-xl shadow-lg p-6 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  {selectedPatient.profile?.name}
                </h1>
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <InfoItem label="Age" value={selectedPatient.profile?.age} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <InfoItem label="Gender" value={selectedPatient.profile?.gender} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <InfoItem label="Condition" value={selectedPatient.profile?.condition} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <InfoItem 
                      label="Device" 
                      value={status?.deviceConnected ? '🟢 Online' : '🔴 Offline'} 
                    />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Alert */}
              <AnimatePresence>
                {alerts?.active && (
                  <motion.div
                    className="mb-6 bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg"
                    initial={{ opacity: 0, x: -50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <motion.div 
                      className="flex items-center gap-3"
                      animate={{ 
                        x: [0, -3, 3, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, -5, 5, 0],
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                      </motion.div>
                      <div>
                        <p className="font-semibold text-destructive">🚨 Alert: {alerts.severity}</p>
                        <p className="text-destructive/80">{alerts.message}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Vitals Grid */}
              <AnimatePresence>
                {vitals ? (
                  <motion.div
                    key="vitals"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
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
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-data"
                    className="bg-background rounded-xl shadow-lg p-8 text-center text-muted-foreground"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    No data available for this patient
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="no-patient"
              className="bg-background rounded-xl shadow-lg p-8 text-center text-muted-foreground"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
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
                <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
              </motion.div>
              <p className="text-xl">Select a patient to view their vitals</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </motion.div>
  );
};

// Helper Components
const InfoItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
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
  <motion.div
    className={`bg-background rounded-xl shadow p-6 transition-all hover:shadow-lg ${
      !normal ? 'ring-2 ring-destructive' : ''
    }`}
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`flex items-center gap-3 ${normal ? 'text-primary' : 'text-destructive'}`}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
      </div>
      {!normal && (
        <motion.span 
          className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          ⚠️ Abnormal
        </motion.span>
      )}
    </div>
    <motion.div 
      className="flex items-baseline gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <span className={`text-3xl font-bold ${normal ? 'text-foreground' : 'text-destructive'}`}>
        {value}
      </span>
      <span className="text-lg text-muted-foreground">{unit}</span>
    </motion.div>
  </motion.div>
);
