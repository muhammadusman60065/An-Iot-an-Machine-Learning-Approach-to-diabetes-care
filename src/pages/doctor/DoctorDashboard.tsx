import { Users, AlertTriangle, Calendar, Activity, TrendingUp, Clock } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import AlertCard from "@/components/dashboard/AlertCard";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with Firebase data
const mockStats = {
  totalPatients: 48,
  activeAlerts: 5,
  todayAppointments: 8,
  criticalPatients: 2,
};

const mockPatients = [
  {
    id: "1",
    name: "John Smith",
    age: 52,
    lastReading: { glucose: 142, status: "warning" },
    lastUpdate: "5 min ago",
  },
  {
    id: "2",
    name: "Mary Johnson",
    age: 45,
    lastReading: { glucose: 98, status: "normal" },
    lastUpdate: "10 min ago",
  },
  {
    id: "3",
    name: "Robert Williams",
    age: 67,
    lastReading: { glucose: 185, status: "danger" },
    lastUpdate: "2 min ago",
  },
  {
    id: "4",
    name: "Sarah Davis",
    age: 38,
    lastReading: { glucose: 110, status: "normal" },
    lastUpdate: "15 min ago",
  },
];

const mockAlerts = [
  {
    id: "1",
    type: "critical" as const,
    title: "Critical: High Glucose Alert",
    message: "Patient Robert Williams has glucose level of 185 mg/dL, requires immediate attention.",
    timestamp: "2 min ago",
    isRead: false,
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Warning: Elevated Reading",
    message: "Patient John Smith's glucose has been above normal range for 2 consecutive readings.",
    timestamp: "15 min ago",
    isRead: false,
  },
  {
    id: "3",
    type: "info" as const,
    title: "New Patient Registration",
    message: "A new patient has been assigned to your care. Review their medical history.",
    timestamp: "1 hour ago",
    isRead: true,
  },
];

const DoctorDashboard = () => {
  const statusColors: Record<string, string> = {
    normal: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  };

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
              Doctor Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage your patients' health
            </p>
          </div>
          <Button>
            <Calendar size={18} />
            Today's Schedule
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Patients"
            value={mockStats.totalPatients}
            unit="patients"
            icon={Users}
            status="normal"
          />
          <MetricCard
            title="Active Alerts"
            value={mockStats.activeAlerts}
            unit="alerts"
            icon={AlertTriangle}
            status="warning"
          />
          <MetricCard
            title="Today's Appointments"
            value={mockStats.todayAppointments}
            unit="scheduled"
            icon={Calendar}
            status="normal"
          />
          <MetricCard
            title="Critical Patients"
            value={mockStats.criticalPatients}
            unit="require attention"
            icon={Activity}
            status="danger"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Recent Patient Activity
              </h2>
              <a href="/doctor/patients" className="text-sm text-primary hover:underline">
                View all
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Patient
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Last Glucose
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Last Update
                    </th>
                    <th className="text-right py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-foreground">
                          {patient.lastReading.glucose} mg/dL
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[patient.lastReading.status]
                          }`}
                        >
                          {patient.lastReading.status.charAt(0).toUpperCase() +
                            patient.lastReading.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock size={14} />
                          {patient.lastUpdate}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Priority Alerts
              </h2>
              <span className="px-2 py-1 bg-danger-light text-danger text-xs font-medium rounded-full">
                {mockAlerts.filter((a) => !a.isRead).length} new
              </span>
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

            <Button variant="outline" className="w-full mt-4">
              View All Alerts
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Users size={24} />
              <span>Add Patient</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Calendar size={24} />
              <span>Schedule Appointment</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <TrendingUp size={24} />
              <span>Generate Report</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <AlertTriangle size={24} />
              <span>Review Alerts</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
