import { Activity, Heart, Thermometer, Droplets, Bell, Loader2, User, Clock, FileText } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import AlertCard from "@/components/dashboard/AlertCard";
import HealthChart from "@/components/dashboard/HealthChart";
import HealthStatusBadge from "@/components/dashboard/HealthStatusBadge";
import LiveDelayIndicator from "@/components/dashboard/LiveDelayIndicator";
import { usePatientRealtimeData } from "@/hooks/usePatientRealtimeData";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HEALTH_THRESHOLDS = {
  glucose: { normal: { min: 70, max: 140 } },
  heartRate: { normal: { min: 60, max: 100 } },
  temperature: { normal: { min: 36.0, max: 37.5 } },
};

const mapStatus = (riskLevel?: string): "normal" | "warning" | "danger" => {
  if (!riskLevel) return "normal";
  if (riskLevel === "critical" || riskLevel === "high") return "danger";
  if (riskLevel === "medium") return "warning";
  return "normal";
};

const PatientDashboard = () => {
  const { userData } = useAuth();
  const {
    vitals,
    vitalsHistory,
    alerts,
    mlPrediction,
    patientInfo,
    isConnected,
    lastUpdated,
    delaySeconds,
    error,
    isSimulated,
  } = usePatientRealtimeData(userData);

  const glucoseHistory = vitalsHistory.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: r.glucose,
  }));

  const heartRateHistory = vitalsHistory.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: r.heartRate,
  }));

  const temperatureHistory = vitalsHistory.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: r.temperature,
  }));

  if (!vitals) {
    return (
      <DashboardLayout role="patient">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading your health data...</span>
        </div>
      </DashboardLayout>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        {/* Header with Live Delay Indicator */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
              Good {greeting}, {userData?.name || "Patient"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Firebase Path: <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">patients/{patientInfo?.id || userData?.email?.split("@")[0]}/vitals</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveDelayIndicator
              lastUpdated={lastUpdated}
              delaySeconds={delaySeconds}
              isConnected={isConnected}
              isSimulated={isSimulated}
            />
            {mlPrediction && (
              <HealthStatusBadge 
                status={mlPrediction.riskLevel === "low" ? "normal" : mlPrediction.riskLevel === "medium" ? "warning" : "critical"} 
                size="lg" 
              />
            )}
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{userData?.name || "Patient"}</p>
                <p className="text-sm text-muted-foreground">{userData?.email}</p>
                <span className="inline-block mt-1 px-3 py-1 text-xs rounded-full bg-primary text-white capitalize">
                  {userData?.role || "patient"}
                </span>
              </div>
            </div>
            {/* Debug: Firebase Timestamp Info */}
            <div className="hidden sm:flex flex-col items-end gap-1 text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} />
                <span>Firebase Timestamp:</span>
              </div>
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                {lastUpdated || "No data"}
              </span>
              <span className="text-xs text-muted-foreground">
                Local: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "--"}
              </span>
              <span className="text-xs text-muted-foreground">
                Delay: <span className={delaySeconds > 10 ? "text-warning" : "text-success"}>{delaySeconds}s ago</span>
              </span>
            </div>
          </div>
        </div>

        {/* ML Anomaly Alert */}
        {mlPrediction && mlPrediction.anomalyStatus && (
          <div className={`p-4 rounded-xl border ${mlPrediction.riskLevel === "critical" ? "bg-danger/10 border-danger/30" : "bg-warning/10 border-warning/30"}`}>
            <div className="flex items-start gap-3">
              <Activity className={`w-5 h-5 ${mlPrediction.riskLevel === "critical" ? "text-danger" : "text-warning"}`} />
              <div className="flex-1">
                <p className="font-medium text-foreground">ML Anomaly Detection Alert</p>
                <p className="text-sm text-muted-foreground mt-1">{mlPrediction.analysis}</p>
                {mlPrediction.recommendations && mlPrediction.recommendations.length > 0 && (
                  <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
                    {mlPrediction.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Confidence: {(mlPrediction.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Vitals Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Blood Glucose"
            value={vitals.glucose}
            unit="mg/dL"
            icon={Droplets}
            status={mapStatus(mlPrediction?.riskLevel)}
            lastUpdated={lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : undefined}
          />
          <MetricCard
            title="Heart Rate"
            value={vitals.heartRate}
            unit="BPM"
            icon={Heart}
            status={mapStatus(mlPrediction?.riskLevel)}
            lastUpdated={lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : undefined}
          />
          <MetricCard
            title="Body Temperature"
            value={vitals.temperature}
            unit="°C"
            icon={Thermometer}
            status={mapStatus(mlPrediction?.riskLevel)}
            lastUpdated={lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : undefined}
          />
          <MetricCard
            title="SpO2"
            value={vitals.spo2}
            unit="%"
            icon={Activity}
            status={vitals.spo2 < 95 ? "danger" : vitals.spo2 < 97 ? "warning" : "normal"}
            lastUpdated={lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : undefined}
          />
        </div>

        {/* Tabs for Charts, Alerts, Reports */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Health Trends</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts {alerts.filter(a => !a.isRead).length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-danger text-white rounded-full">
                  {alerts.filter(a => !a.isRead).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <HealthChart 
                title="Blood Glucose Trend" 
                data={[...glucoseHistory].reverse()} 
                color="hsl(174, 72%, 40%)" 
                unit="mg/dL" 
                normalRange={HEALTH_THRESHOLDS.glucose.normal} 
              />
              <HealthChart 
                title="Heart Rate Trend" 
                data={[...heartRateHistory].reverse()} 
                color="hsl(0, 84%, 60%)" 
                unit="BPM" 
                normalRange={HEALTH_THRESHOLDS.heartRate.normal} 
              />
            </div>
            <HealthChart 
              title="Body Temperature Trend" 
              data={[...temperatureHistory].reverse()} 
              color="hsl(36, 100%, 50%)" 
              unit="°C" 
              normalRange={HEALTH_THRESHOLDS.temperature.normal} 
            />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
                  <Bell size={20} className="text-primary" />
                  Health Alerts
                </h2>
                <span className="px-3 py-1 bg-danger/10 text-danger text-sm font-medium rounded-full">
                  {alerts.filter(a => !a.isRead).length} unread
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <AlertCard 
                      key={alert.id} 
                      id={alert.id} 
                      type={alert.type} 
                      title={alert.metric} 
                      message={alert.message} 
                      timestamp={new Date(alert.timestamp).toLocaleString()} 
                      isRead={alert.isRead} 
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No alerts. Your health readings are normal.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  Health Reports
                </h2>
                <Button variant="outline" size="sm">
                  Download Report
                </Button>
              </div>
              
              {/* Summary Report */}
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h3 className="font-medium text-foreground mb-3">Today's Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Avg Glucose</span>
                      <p className="font-semibold text-foreground">
                        {vitalsHistory.length > 0 
                          ? (vitalsHistory.reduce((sum, v) => sum + v.glucose, 0) / vitalsHistory.length).toFixed(1) 
                          : vitals.glucose} mg/dL
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Heart Rate</span>
                      <p className="font-semibold text-foreground">
                        {vitalsHistory.length > 0 
                          ? (vitalsHistory.reduce((sum, v) => sum + v.heartRate, 0) / vitalsHistory.length).toFixed(0) 
                          : vitals.heartRate} BPM
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Readings</span>
                      <p className="font-semibold text-foreground">{vitalsHistory.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Alerts</span>
                      <p className="font-semibold text-foreground">{alerts.length}</p>
                    </div>
                  </div>
                </div>

                {/* Alert Log */}
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h3 className="font-medium text-foreground mb-3">Alert History</h3>
                  {alerts.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {alerts.slice(0, 10).map(alert => (
                        <div key={alert.id} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${alert.type === "critical" ? "bg-danger" : "bg-warning"}`} />
                            <span className="text-foreground">{alert.message}</span>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No alerts recorded</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Connected Devices */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Connected IoT Devices</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`flex items-center gap-4 p-4 rounded-xl ${isConnected ? "bg-success/10" : "bg-warning/10"}`}>
              <Activity className={`w-5 h-5 ${isConnected ? "text-success" : "text-warning"}`} />
              <div>
                <p className="font-medium text-foreground">ESP8266 Sensor Hub</p>
                <p className={`text-sm ${isConnected ? "text-success" : "text-warning"}`}>
                  {isSimulated ? "Simulated Mode" : isConnected ? "Connected" : "Disconnected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-success/10 rounded-xl">
              <Droplets className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground">Glucose Monitor</p>
                <p className="text-sm text-success">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-success/10 rounded-xl">
              <Heart className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground">Heart Monitor</p>
                <p className="text-sm text-success">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
