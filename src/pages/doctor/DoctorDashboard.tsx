import { Users, AlertTriangle, Calendar, Activity, TrendingUp, Clock, Loader2, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import AlertCard from "@/components/dashboard/AlertCard";
import HealthStatusBadge from "@/components/dashboard/HealthStatusBadge";
import SimulatedDataBanner from "@/components/dashboard/SimulatedDataBanner";
import { Button } from "@/components/ui/button";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { useAuth } from "@/contexts/AuthContext";
import { detectAnomalies } from "@/lib/anomalyDetection";
import type { HealthStatus, Patient } from "@/lib/anomalyDetection";

const DoctorDashboard = () => {
  const { patients, alerts, isLoading, isSimulated } = useFirebaseData();
  const { userData } = useAuth();

  const getPatientStatus = (patient: Patient): HealthStatus => {
    if (!patient.lastReading) return "normal";
    return detectAnomalies(patient.lastReading).status;
  };

  const criticalCount = patients.filter((p) => getPatientStatus(p) === "critical").length;
  const warningCount = patients.filter((p) => getPatientStatus(p) === "warning").length;

  if (isLoading) {
    return (
      <DashboardLayout role="doctor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading patient data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-8">
        <SimulatedDataBanner isSimulated={isSimulated} />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
              Welcome, Dr. {userData?.name || "Doctor"}
            </h1>
            <p className="text-muted-foreground mt-1">Monitor and manage your patients' health</p>
          </div>
          <Button><Calendar size={18} className="mr-2" />Today's Schedule</Button>
        </div>

        {/* User Info Card */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-info flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{userData?.name || "Doctor"}</p>
              <p className="text-sm text-muted-foreground">{userData?.email}</p>
              <span className="inline-block mt-1 px-3 py-1 text-xs rounded-full bg-info text-white capitalize">
                {userData?.role || "doctor"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Patients" value={patients.length} unit="patients" icon={Users} status="normal" />
          <MetricCard title="Active Alerts" value={alerts.filter((a) => !a.isRead).length} unit="alerts" icon={AlertTriangle} status={alerts.length > 0 ? "warning" : "normal"} />
          <MetricCard title="Warning Patients" value={warningCount} unit="need attention" icon={Activity} status={warningCount > 0 ? "warning" : "normal"} />
          <MetricCard title="Critical Patients" value={criticalCount} unit="require attention" icon={AlertTriangle} status={criticalCount > 0 ? "danger" : "normal"} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">Patient Readings (Real-time)</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Glucose</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Heart Rate</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Temp</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ML Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <p className="font-medium text-foreground">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold">{patient.lastReading?.glucose || "-"} mg/dL</td>
                      <td className="py-4 px-4">{patient.lastReading?.heartRate || "-"} BPM</td>
                      <td className="py-4 px-4">{patient.lastReading?.temperature || "-"}°C</td>
                      <td className="py-4 px-4"><HealthStatusBadge status={getPatientStatus(patient)} size="sm" /></td>
                      <td className="py-4 px-4 text-sm text-muted-foreground flex items-center gap-1">
                        <Clock size={14} />
                        {patient.lastReading ? new Date(patient.lastReading.timestamp).toLocaleTimeString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-foreground">ML-Generated Alerts</h2>
              <span className="px-2 py-1 bg-danger-light text-danger text-xs font-medium rounded-full">{alerts.filter((a) => !a.isRead).length} new</span>
            </div>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.slice(0, 5).map((alert) => (
                  <AlertCard key={alert.id} id={alert.id} type={alert.type} title={alert.title} message={alert.message} timestamp={new Date(alert.timestamp).toLocaleString()} isRead={alert.isRead} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No active alerts</div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">View All Alerts</Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2"><Users size={24} /><span>View All Patients</span></Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2"><Calendar size={24} /><span>Schedule Appointment</span></Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2"><TrendingUp size={24} /><span>Generate Report</span></Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2"><AlertTriangle size={24} /><span>Review Alerts</span></Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
