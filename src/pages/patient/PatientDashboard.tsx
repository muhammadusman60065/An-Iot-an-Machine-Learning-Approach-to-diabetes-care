import { Activity, Heart, Thermometer, Droplets, Bell } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import AlertCard from "@/components/dashboard/AlertCard";
import HealthChart from "@/components/dashboard/HealthChart";

// Mock data - will be replaced with Firebase data
const mockHealthData = {
  glucose: 118,
  heartRate: 72,
  temperature: 36.6,
  oxygenLevel: 98,
};

const mockGlucoseHistory = [
  { time: "6 AM", value: 95 },
  { time: "8 AM", value: 110 },
  { time: "10 AM", value: 125 },
  { time: "12 PM", value: 118 },
  { time: "2 PM", value: 130 },
  { time: "4 PM", value: 115 },
  { time: "6 PM", value: 120 },
  { time: "8 PM", value: 108 },
];

const mockHeartRateHistory = [
  { time: "6 AM", value: 65 },
  { time: "8 AM", value: 72 },
  { time: "10 AM", value: 78 },
  { time: "12 PM", value: 75 },
  { time: "2 PM", value: 82 },
  { time: "4 PM", value: 76 },
  { time: "6 PM", value: 70 },
  { time: "8 PM", value: 68 },
];

const mockAlerts = [
  {
    id: "1",
    type: "warning" as const,
    title: "Elevated Glucose Level",
    message: "Your glucose reading of 130 mg/dL at 2 PM was slightly above normal range.",
    timestamp: "2 hours ago",
    isRead: false,
  },
  {
    id: "2",
    type: "info" as const,
    title: "Daily Summary Ready",
    message: "Your health summary for today is now available. Tap to view details.",
    timestamp: "5 hours ago",
    isRead: true,
  },
];

const PatientDashboard = () => {
  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
            Good afternoon, Patient
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your health overview for today
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Blood Glucose"
            value={mockHealthData.glucose}
            unit="mg/dL"
            icon={Droplets}
            trend="stable"
            trendValue="Normal"
            status="normal"
            lastUpdated="2 min ago"
          />
          <MetricCard
            title="Heart Rate"
            value={mockHealthData.heartRate}
            unit="BPM"
            icon={Heart}
            trend="down"
            trendValue="-3%"
            status="normal"
            lastUpdated="5 min ago"
          />
          <MetricCard
            title="Body Temperature"
            value={mockHealthData.temperature}
            unit="°C"
            icon={Thermometer}
            trend="stable"
            trendValue="Normal"
            status="normal"
            lastUpdated="10 min ago"
          />
          <MetricCard
            title="Oxygen Level"
            value={mockHealthData.oxygenLevel}
            unit="%"
            icon={Activity}
            trend="up"
            trendValue="+1%"
            status="normal"
            lastUpdated="3 min ago"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <HealthChart
            title="Blood Glucose Trend"
            data={mockGlucoseHistory}
            color="hsl(174, 72%, 40%)"
            unit="mg/dL"
            normalRange={{ min: 70, max: 130 }}
          />
          <HealthChart
            title="Heart Rate Trend"
            data={mockHeartRateHistory}
            color="hsl(0, 84%, 60%)"
            unit="BPM"
            normalRange={{ min: 60, max: 100 }}
          />
        </div>

        {/* Alerts Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              Recent Alerts
            </h2>
            <a href="/patient/alerts" className="text-sm text-primary hover:underline">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                {...alert}
                onDismiss={(id) => console.log("Dismiss", id)}
                onAction={(id) => console.log("Action", id)}
              />
            ))}
          </div>
        </div>

        {/* IoT Device Status */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
            Connected Devices
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-success-light rounded-xl">
              <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-success-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">ESP8266 Sensor Hub</p>
                <p className="text-sm text-success">Connected • Active</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-success-light rounded-xl">
              <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-success-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Glucose Monitor</p>
                <p className="text-sm text-success">Online • Battery 85%</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
              <div className="w-10 h-10 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Heart Monitor</p>
                <p className="text-sm text-muted-foreground">Syncing...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
