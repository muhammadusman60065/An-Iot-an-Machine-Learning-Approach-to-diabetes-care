import { useState, useEffect } from "react";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  User,
  Clock,
  Cpu,
  Radio
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VitalCard } from "@/components/iot/VitalCard";
import { AlertsPanel } from "@/components/iot/AlertsPanel";
import { MLPredictionPanel } from "@/components/iot/MLPredictionPanel";
import { PatientSelector } from "@/components/iot/PatientSelector";
import { VitalsChart } from "@/components/iot/VitalsChart";
import { useRealtimePatient, useAllPatients } from "@/hooks/useRealtimePatient";
import { motion, AnimatePresence } from "framer-motion";

// Threshold constants for status determination
const THRESHOLDS = {
  temperature: { min: 36.0, max: 37.5, criticalMin: 35.0, criticalMax: 39.0 },
  heartRate: { min: 60, max: 100, criticalMin: 40, criticalMax: 150 },
  spo2: { min: 95, max: 100, criticalMin: 90, criticalMax: 100 },
  glucose: { min: 70, max: 140, criticalMin: 54, criticalMax: 250 },
};

const getVitalStatus = (
  value: number,
  thresholds: { min: number; max: number; criticalMin: number; criticalMax: number }
): "normal" | "warning" | "critical" => {
  if (value <= thresholds.criticalMin || value >= thresholds.criticalMax) return "critical";
  if (value < thresholds.min || value > thresholds.max) return "warning";
  return "normal";
};

const IoTDashboard = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("P001");
  const { patients, isLoading: patientsLoading } = useAllPatients();
  const { 
    vitals, 
    vitalsHistory, 
    alerts, 
    mlPrediction, 
    patientInfo, 
    isConnected, 
    lastUpdated,
    error 
  } = useRealtimePatient(selectedPatientId);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDismissAlert = (alertId: string) => {
    // In production, this would update Firebase
    console.log("Dismissing alert:", alertId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Activity className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">DiabetesCare IoT</h1>
                <p className="text-xs text-muted-foreground">Real-Time Patient Monitoring</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Connection Status */}
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                {isConnected ? (
                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                    <Wifi className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
              </motion.div>

              {/* Current Time */}
              <motion.div 
                className="flex items-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </motion.div>

              {/* Refresh Button */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <AnimatePresence>
          {error && (
            <motion.div 
              className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Sidebar - Patient Selection */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            variants={itemVariants}
          >
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Select Patient
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PatientSelector
                    patients={patients}
                    selectedPatientId={selectedPatientId}
                    onSelectPatient={setSelectedPatientId}
                    isLoading={patientsLoading}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Patient Info */}
            <AnimatePresence>
              {patientInfo && (
                <motion.div
                  variants={cardVariants}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Patient Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <motion.div 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div 
                          className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <User className="w-6 h-6 text-primary" />
                        </motion.div>
                        <div>
                          <p className="font-medium">{patientInfo.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {patientInfo.id}</p>
                        </div>
                      </motion.div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Age</p>
                          <p className="font-medium">{patientInfo.age} years</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Room</p>
                          <p className="font-medium">{patientInfo.roomNumber}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Condition</p>
                        <p className="font-medium">{patientInfo.condition}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* IoT Device Status */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    IoT Device
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ESP8266</span>
                    <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                      <Radio className="w-3 h-3 mr-1 animate-pulse" />
                      Active
                    </Badge>
                  </div>
                  {lastUpdated && (
                    <motion.div 
                      className="text-xs text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Last reading: {new Date(lastUpdated).toLocaleString()}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Dashboard */}
          <motion.div 
            className="lg:col-span-3 space-y-6"
            variants={itemVariants}
          >
            {/* Live Sensor Data Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="flex items-center gap-2 mb-4"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Live Sensor Data</h2>
                {isConnected && (
                  <motion.div 
                    className="flex items-center gap-1 ml-2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-emerald-500"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">Real-time</span>
                  </motion.div>
                )}
              </motion.div>

              {vitals ? (
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    { title: "Temperature", value: vitals.temperature, unit: "°C", icon: "temperature" as const, thresholds: THRESHOLDS.temperature },
                    { title: "Heart Rate", value: vitals.heartRate, unit: "bpm", icon: "heartRate" as const, thresholds: THRESHOLDS.heartRate },
                    { title: "SpO₂", value: vitals.spo2, unit: "%", icon: "spo2" as const, thresholds: THRESHOLDS.spo2 },
                    { title: "Glucose", value: vitals.glucose, unit: "mg/dL", icon: "glucose" as const, thresholds: THRESHOLDS.glucose },
                    { title: "Humidity", value: vitals.humidity, unit: "%", icon: "humidity" as const, thresholds: { min: 30, max: 70, criticalMin: 30, criticalMax: 70 } },
                  ].map((vital, index) => (
                    <motion.div
                      key={vital.title}
                      variants={itemVariants}
                      whileHover={{ y: -5, scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <VitalCard
                        title={vital.title}
                        value={vital.value}
                        unit={vital.unit}
                        icon={vital.icon}
                        status={getVitalStatus(vital.value, vital.thresholds)}
                        min={vital.thresholds.min}
                        max={vital.thresholds.max}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className="h-32 rounded-xl bg-muted/50"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.section>

            {/* Vitals Charts */}
            <AnimatePresence>
              {vitalsHistory.length > 1 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.h2 
                    className="text-lg font-semibold mb-4"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Vital Trends
                  </motion.h2>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {[
                      { metric: "heartRate", color: "hsl(var(--primary))", title: "Heart Rate", unit: "bpm" },
                      { metric: "glucose", color: "#f59e0b", title: "Blood Glucose", unit: "mg/dL" },
                      { metric: "temperature", color: "#ef4444", title: "Temperature", unit: "°C" },
                      { metric: "spo2", color: "#10b981", title: "SpO₂", unit: "%" },
                    ].map((chart, index) => (
                      <motion.div
                        key={chart.metric}
                        variants={itemVariants}
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <VitalsChart
                          data={vitalsHistory}
                          metric={chart.metric as "heartRate" | "glucose" | "temperature" | "spo2"}
                          color={chart.color}
                          title={chart.title}
                          unit={chart.unit}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Alerts and ML Section */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Alerts Section */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-500" />
                      Real-Time Alerts
                      {alerts.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Badge variant="destructive" className="ml-auto">
                            {alerts.length}
                          </Badge>
                        </motion.div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AlertsPanel alerts={alerts} onDismiss={handleDismissAlert} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* ML Predictions Section */}
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary" />
                      ML Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MLPredictionPanel prediction={mlPrediction} />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Firebase Paths Reference */}
            <motion.div
              variants={cardVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Firebase Data Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {[
                      { label: "Vitals Path", path: `/patients/${selectedPatientId}/vitals`, color: "text-primary" },
                      { label: "Alerts Path", path: `/patients/${selectedPatientId}/alerts`, color: "text-amber-400" },
                      { label: "ML Path (Reserved)", path: `/patients/${selectedPatientId}/ml`, color: "text-emerald-400" },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="p-3 rounded-lg bg-muted/30"
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-muted-foreground mb-1">{item.label}</p>
                        <p className={item.color}>{item.path}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default IoTDashboard;
