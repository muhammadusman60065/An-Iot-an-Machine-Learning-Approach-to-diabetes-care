import { Activity, Heart, Thermometer, Droplets, Bell, Loader2, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import AlertCard from "@/components/dashboard/AlertCard";
import HealthChart from "@/components/dashboard/HealthChart";
import HealthStatusBadge from "@/components/dashboard/HealthStatusBadge";
import SimulatedDataBanner from "@/components/dashboard/SimulatedDataBanner";
import { useFirebaseData, HEALTH_THRESHOLDS } from "@/hooks/useFirebaseData";
import { useAuth } from "@/contexts/AuthContext";

const PatientDashboard = () => {
  const { currentReading, readingHistory, alerts, anomalyResult, isLoading, isSimulated } = useFirebaseData();
  const { userData } = useAuth();

  const glucoseHistory = readingHistory.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: r.glucose,
  }));

  const heartRateHistory = readingHistory.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: r.heartRate,
  }));

  const temperatureHistory = readingHistory.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: r.temperature,
  }));

  if (isLoading) {
    return (
      <DashboardLayout role="patient">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading health data...</span>
        </div>
      </DashboardLayout>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        <SimulatedDataBanner isSimulated={isSimulated} />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
              Good {greeting}, {userData?.name || "Patient"}
            </h1>
            <p className="text-muted-foreground mt-1">Here's your health overview for today</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Overall Status:</span>
            {anomalyResult && <HealthStatusBadge status={anomalyResult.status} size="lg" />}
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
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
        </div>

        {anomalyResult && anomalyResult.issues.length > 0 && (
          <div className={`p-4 rounded-xl border ${anomalyResult.status === "critical" ? "bg-danger-light border-danger/30" : "bg-warning-light border-warning/30"}`}>
            <div className="flex items-start gap-3">
              <Activity className={`w-5 h-5 ${anomalyResult.status === "critical" ? "text-danger" : "text-warning"}`} />
              <div>
                <p className="font-medium text-foreground">ML Anomaly Detection Alert</p>
                <ul className="text-sm text-muted-foreground mt-1">
                  {anomalyResult.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Blood Glucose"
            value={currentReading?.glucose || 0}
            unit="mg/dL"
            icon={Droplets}
            status={anomalyResult?.glucoseStatus || "normal"}
            lastUpdated={currentReading ? new Date(currentReading.timestamp).toLocaleTimeString() : undefined}
          />
          <MetricCard
            title="Heart Rate"
            value={currentReading?.heartRate || 0}
            unit="BPM"
            icon={Heart}
            status={anomalyResult?.heartRateStatus || "normal"}
            lastUpdated={currentReading ? new Date(currentReading.timestamp).toLocaleTimeString() : undefined}
          />
          <MetricCard
            title="Body Temperature"
            value={currentReading?.temperature || 0}
            unit="°C"
            icon={Thermometer}
            status={anomalyResult?.temperatureStatus || "normal"}
            lastUpdated={currentReading ? new Date(currentReading.timestamp).toLocaleTimeString() : undefined}
          />
          <MetricCard
            title="Health Score"
            value={anomalyResult?.status === "normal" ? 100 : anomalyResult?.status === "warning" ? 75 : 50}
            unit="%"
            icon={Activity}
            status={anomalyResult?.status || "normal"}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <HealthChart title="Blood Glucose Trend" data={[...glucoseHistory].reverse()} color="hsl(174, 72%, 40%)" unit="mg/dL" normalRange={HEALTH_THRESHOLDS.glucose.normal} />
          <HealthChart title="Heart Rate Trend" data={[...heartRateHistory].reverse()} color="hsl(0, 84%, 60%)" unit="BPM" normalRange={HEALTH_THRESHOLDS.heartRate.normal} />
        </div>

        <HealthChart title="Body Temperature Trend" data={[...temperatureHistory].reverse()} color="hsl(36, 100%, 50%)" unit="°C" normalRange={HEALTH_THRESHOLDS.temperature.normal} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              ML-Generated Alerts
            </h2>
          </div>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.slice(0, 5).map((alert) => (
                <AlertCard key={alert.id} id={alert.id} type={alert.type} title={alert.title} message={alert.message} timestamp={new Date(alert.timestamp).toLocaleString()} isRead={alert.isRead} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No alerts. Your health readings are normal.</div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Connected IoT Devices</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`flex items-center gap-4 p-4 rounded-xl ${isSimulated ? "bg-warning-light" : "bg-success-light"}`}>
              <Activity className={`w-5 h-5 ${isSimulated ? "text-warning" : "text-success"}`} />
              <div>
                <p className="font-medium text-foreground">ESP8266 Sensor Hub</p>
                <p className={`text-sm ${isSimulated ? "text-warning" : "text-success"}`}>{isSimulated ? "Simulated Mode" : "Connected"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-success-light rounded-xl">
              <Droplets className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground">Glucose Monitor</p>
                <p className="text-sm text-success">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-success-light rounded-xl">
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
