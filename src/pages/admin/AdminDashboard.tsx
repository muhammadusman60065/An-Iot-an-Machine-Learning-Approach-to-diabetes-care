import { Users, Activity, Server, AlertTriangle, TrendingUp, Database, Cpu, Wifi, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import HealthChart from "@/components/dashboard/HealthChart";
import SimulatedDataBanner from "@/components/dashboard/SimulatedDataBanner";
import { Button } from "@/components/ui/button";
import { useFirebaseData } from "@/hooks/useFirebaseData";

const AdminDashboard = () => {
  const { patients, alerts, isLoading, isSimulated } = useFirebaseData();

  // Mock system stats
  const mockUserBreakdown = [
    { role: "Patients", count: patients.length || 120, color: "bg-primary" },
    { role: "Doctors", count: 28, color: "bg-info" },
    { role: "Admins", count: 8, color: "bg-warning" },
  ];

  const totalUsers = mockUserBreakdown.reduce((sum, item) => sum + item.count, 0);

  const mockSystemActivity = [
    { time: "00:00", value: 45 },
    { time: "04:00", value: 32 },
    { time: "08:00", value: 78 },
    { time: "12:00", value: 95 },
    { time: "16:00", value: 88 },
    { time: "20:00", value: 72 },
    { time: "24:00", value: 56 },
  ];

  const mockRecentActivity = [
    {
      id: "1",
      action: "New patient registered",
      user: "John Doe",
      time: "2 min ago",
      type: "user",
    },
    {
      id: "2",
      action: "IoT device connected",
      user: "ESP8266-Device-42",
      time: "5 min ago",
      type: "device",
    },
    {
      id: "3",
      action: "ML alert triggered",
      user: "Anomaly Detection",
      time: "15 min ago",
      type: "alert",
    },
    {
      id: "4",
      action: "Doctor assigned patient",
      user: "Dr. Smith",
      time: "30 min ago",
      type: "user",
    },
    {
      id: "5",
      action: "Firebase sync completed",
      user: "System",
      time: "1 hour ago",
      type: "system",
    },
  ];

  const activityIcons: Record<string, any> = {
    user: Users,
    device: Wifi,
    alert: AlertTriangle,
    system: Server,
  };

  const activityColors: Record<string, string> = {
    user: "bg-primary-light text-primary",
    device: "bg-success-light text-success",
    alert: "bg-warning-light text-warning",
    system: "bg-info-light text-info",
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading system data...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Simulated Data Banner */}
        <SimulatedDataBanner isSimulated={isSimulated} />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
              System Administration
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage the DiabetesCare platform
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Database size={18} />
              Backup Data
            </Button>
            <Button>
              <TrendingUp size={18} />
              Generate Report
            </Button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={totalUsers}
            unit="registered"
            icon={Users}
            trend="up"
            trendValue="+12"
            status="normal"
          />
          <MetricCard
            title="Active IoT Devices"
            value={isSimulated ? 6 : 89}
            unit="online"
            icon={Cpu}
            trend="up"
            trendValue="+5"
            status="normal"
          />
          <MetricCard
            title="System Health"
            value={99.8}
            unit="%"
            icon={Activity}
            trend="stable"
            trendValue="Optimal"
            status="normal"
          />
          <MetricCard
            title="Pending Alerts"
            value={alerts.filter((a) => !a.isRead).length}
            unit="unresolved"
            icon={AlertTriangle}
            status={alerts.filter((a) => !a.isRead).length > 0 ? "warning" : "normal"}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Distribution */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
              User Distribution
            </h2>
            <div className="space-y-4">
              {mockUserBreakdown.map((item) => (
                <div key={item.role}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{item.role}</span>
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(item.count / totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">{totalUsers} users</span>
              </div>
            </div>
          </div>

          {/* System Activity Chart */}
          <div className="lg:col-span-2">
            <HealthChart
              title="System Activity (24h)"
              data={mockSystemActivity}
              color="hsl(174, 72%, 40%)"
              unit="requests/min"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Recent Activity
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {mockRecentActivity.map((activity) => {
                const Icon = activityIcons[activity.type];
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activityColors[activity.type]}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
              System Status
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success-light rounded-xl">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-success" />
                  <span className="font-medium text-foreground">Firebase Server</span>
                </div>
                <span className="px-2 py-1 bg-success text-success-foreground text-xs rounded-full">
                  Online
                </span>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-xl ${isSimulated ? "bg-warning-light" : "bg-success-light"}`}>
                <div className="flex items-center gap-3">
                  <Database className={`w-5 h-5 ${isSimulated ? "text-warning" : "text-success"}`} />
                  <span className="font-medium text-foreground">Real-time Database</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${isSimulated ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}`}>
                  {isSimulated ? "Simulated" : "Synced"}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-success-light rounded-xl">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-success" />
                  <span className="font-medium text-foreground">ML Pipeline</span>
                </div>
                <span className="px-2 py-1 bg-success text-success-foreground text-xs rounded-full">
                  Active
                </span>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-xl ${isSimulated ? "bg-warning-light" : "bg-success-light"}`}>
                <div className="flex items-center gap-3">
                  <Wifi className={`w-5 h-5 ${isSimulated ? "text-warning" : "text-success"}`} />
                  <span className="font-medium text-foreground">IoT Gateway</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${isSimulated ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}`}>
                  {isSimulated ? "Demo Mode" : "Online"}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Server Uptime</span>
                <span className="text-sm font-semibold text-foreground">99.98%</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: "99.98%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
