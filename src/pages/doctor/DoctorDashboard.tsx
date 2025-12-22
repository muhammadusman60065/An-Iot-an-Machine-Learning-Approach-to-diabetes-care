import { Users, AlertTriangle, Calendar, Activity, TrendingUp, Clock, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import AlertCard from "@/components/dashboard/AlertCard";
import HealthStatusBadge from "@/components/dashboard/HealthStatusBadge";
import SimulatedDataBanner from "@/components/dashboard/SimulatedDataBanner";
import { Button } from "@/components/ui/button";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { detectAnomalies } from "@/lib/anomalyDetection";
import type { HealthStatus } from "@/types/health";

const DoctorDashboard = () => {
  const { patients, alerts, isLoading, isSimulated } = useFirebaseData();

  // Calculate stats from patients
  const criticalPatients = patients.filter((p) => {
    if (!p.lastReading) return false;
    const anomaly = detectAnomalies(p.lastReading);
    return anomaly.status === "critical";
  });

  const warningPatients = patients.filter((p) => {
    if (!p.lastReading) return false;
    const anomaly = detectAnomalies(p.lastReading);
    return anomaly.status === "warning";
  });

  const getPatientStatus = (patient: typeof patients[0]): HealthStatus => {
    if (!patient.lastReading) return "normal";
    const anomaly = detectAnomalies(patient.lastReading);
    return anomaly.status;
  };

  if (isLoading) {
    return (
      <DashboardLayout role="doctor">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading patient data...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-8">
        {/* Simulated Data Banner */}
        <SimulatedDataBanner isSimulated={isSimulated} />

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
            value={patients.length}
            unit="patients"
            icon={Users}
            status="normal"
          />
          <MetricCard
            title="Active Alerts"
            value={alerts.filter((a) => !a.isRead).length}
            unit="alerts"
            icon={AlertTriangle}
            status={alerts.filter((a) => !a.isRead).length > 0 ? "warning" : "normal"}
          />
          <MetricCard
            title="Warning Patients"
            value={warningPatients.length}
            unit="need attention"
            icon={Activity}
            status={warningPatients.length > 0 ? "warning" : "normal"}
          />
          <MetricCard
            title="Critical Patients"
            value={criticalPatients.length}
            unit="require attention"
            icon={AlertTriangle}
            status={criticalPatients.length > 0 ? "danger" : "normal"}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Patient Readings (Real-time)
              </h2>
              <span className="text-sm text-muted-foreground">
                ML-Analyzed Status
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Patient
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Glucose
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Heart Rate
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Temp
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      ML Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const status = getPatientStatus(patient);
                    return (
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
                            {patient.lastReading?.glucose || "-"} mg/dL
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-foreground">
                            {patient.lastReading?.heartRate || "-"} BPM
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-foreground">
                            {patient.lastReading?.temperature || "-"}°C
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <HealthStatusBadge status={status} size="sm" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {patient.lastReading
                              ? new Date(patient.lastReading.timestamp).toLocaleTimeString()
                              : "-"}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                ML-Generated Alerts
              </h2>
              <span className="px-2 py-1 bg-danger-light text-danger text-xs font-medium rounded-full">
                {alerts.filter((a) => !a.isRead).length} new
              </span>
            </div>

            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.slice(0, 5).map((alert) => (
                  <AlertCard
                    key={alert.id}
                    id={alert.id}
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    timestamp={new Date(alert.timestamp).toLocaleString()}
                    isRead={alert.isRead}
                    onDismiss={(id) => console.log("Dismiss", id)}
                    onAction={(id) => console.log("Action", id)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No active alerts
                </div>
              )}
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
              <span>View All Patients</span>
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
