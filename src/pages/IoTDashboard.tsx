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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">DiabetesCare IoT</h1>
                <p className="text-xs text-muted-foreground">Real-Time Patient Monitoring</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
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
              </div>

              {/* Current Time */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>

              {/* Refresh Button */}
              <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Patient Selection */}
          <div className="lg:col-span-1 space-y-6">
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

            {/* Patient Info */}
            {patientInfo && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Patient Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{patientInfo.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {patientInfo.id}</p>
                    </div>
                  </div>
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
            )}

            {/* IoT Device Status */}
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
                  <div className="text-xs text-muted-foreground">
                    Last reading: {new Date(lastUpdated).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-3 space-y-6">
            {/* Live Sensor Data Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Live Sensor Data</h2>
                {isConnected && (
                  <div className="flex items-center gap-1 ml-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Real-time</span>
                  </div>
                )}
              </div>

              {vitals ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <VitalCard
                    title="Temperature"
                    value={vitals.temperature}
                    unit="°C"
                    icon="temperature"
                    status={getVitalStatus(vitals.temperature, THRESHOLDS.temperature)}
                    min={THRESHOLDS.temperature.min}
                    max={THRESHOLDS.temperature.max}
                  />
                  <VitalCard
                    title="Heart Rate"
                    value={vitals.heartRate}
                    unit="bpm"
                    icon="heartRate"
                    status={getVitalStatus(vitals.heartRate, THRESHOLDS.heartRate)}
                    min={THRESHOLDS.heartRate.min}
                    max={THRESHOLDS.heartRate.max}
                  />
                  <VitalCard
                    title="SpO₂"
                    value={vitals.spo2}
                    unit="%"
                    icon="spo2"
                    status={getVitalStatus(vitals.spo2, THRESHOLDS.spo2)}
                    min={THRESHOLDS.spo2.min}
                    max={THRESHOLDS.spo2.max}
                  />
                  <VitalCard
                    title="Glucose"
                    value={vitals.glucose}
                    unit="mg/dL"
                    icon="glucose"
                    status={getVitalStatus(vitals.glucose, THRESHOLDS.glucose)}
                    min={THRESHOLDS.glucose.min}
                    max={THRESHOLDS.glucose.max}
                  />
                  <VitalCard
                    title="Humidity"
                    value={vitals.humidity}
                    unit="%"
                    icon="humidity"
                    status="normal"
                    min={30}
                    max={70}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
                  ))}
                </div>
              )}
            </section>

            {/* Vitals Charts */}
            {vitalsHistory.length > 1 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Vital Trends</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <VitalsChart
                    data={vitalsHistory}
                    metric="heartRate"
                    color="hsl(var(--primary))"
                    title="Heart Rate"
                    unit="bpm"
                  />
                  <VitalsChart
                    data={vitalsHistory}
                    metric="glucose"
                    color="#f59e0b"
                    title="Blood Glucose"
                    unit="mg/dL"
                  />
                  <VitalsChart
                    data={vitalsHistory}
                    metric="temperature"
                    color="#ef4444"
                    title="Temperature"
                    unit="°C"
                  />
                  <VitalsChart
                    data={vitalsHistory}
                    metric="spo2"
                    color="#10b981"
                    title="SpO₂"
                    unit="%"
                  />
                </div>
              </section>
            )}

            {/* Alerts and ML Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alerts Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    Real-Time Alerts
                    {alerts.length > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {alerts.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertsPanel alerts={alerts} onDismiss={handleDismissAlert} />
                </CardContent>
              </Card>

              {/* ML Predictions Section */}
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
            </div>

            {/* Firebase Paths Reference */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Firebase Data Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground mb-1">Vitals Path</p>
                    <p className="text-primary">/patients/{selectedPatientId}/vitals</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground mb-1">Alerts Path</p>
                    <p className="text-amber-400">/patients/{selectedPatientId}/alerts</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground mb-1">ML Path (Reserved)</p>
                    <p className="text-emerald-400">/patients/{selectedPatientId}/ml</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IoTDashboard;
