import { useState } from "react";
import { Users, AlertTriangle, Calendar, Activity, TrendingUp, Clock, Loader2, User, Bell, FileText, Heart, Thermometer, Droplets } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import AlertCard from "@/components/dashboard/AlertCard";
import LiveDelayIndicator from "@/components/dashboard/LiveDelayIndicator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDoctorPatients, PatientFullData } from "@/hooks/useDoctorPatients";
import { useAuth } from "@/contexts/AuthContext";

const getRiskColor = (riskLevel?: string) => {
  switch (riskLevel) {
    case "critical": return "text-danger";
    case "high": return "text-warning";
    case "medium": return "text-warning";
    default: return "text-success";
  }
};

const getRiskBg = (riskLevel?: string) => {
  switch (riskLevel) {
    case "critical": return "bg-danger/10";
    case "high": return "bg-warning/10";
    case "medium": return "bg-warning/10";
    default: return "bg-success/10";
  }
};

const DoctorDashboard = () => {
  const { userData } = useAuth();
  const { 
    assignedPatients, 
    allAlerts, 
    criticalCount, 
    warningCount, 
    isLoading 
  } = useDoctorPatients(userData);
  
  const [selectedPatient, setSelectedPatient] = useState<PatientFullData | null>(null);

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
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
              Welcome, Dr. {userData?.name || "Doctor"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor your assigned patients' health in real-time
            </p>
          </div>
          <Button>
            <Calendar size={18} className="mr-2" />
            Today's Schedule
          </Button>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Assigned Patients" 
            value={assignedPatients.length} 
            unit="patients" 
            icon={Users} 
            status="normal" 
          />
          <MetricCard 
            title="Active Alerts" 
            value={allAlerts.filter(a => !a.isRead).length} 
            unit="alerts" 
            icon={AlertTriangle} 
            status={allAlerts.length > 0 ? "warning" : "normal"} 
          />
          <MetricCard 
            title="Warning Patients" 
            value={warningCount} 
            unit="need attention" 
            icon={Activity} 
            status={warningCount > 0 ? "warning" : "normal"} 
          />
          <MetricCard 
            title="Critical Patients" 
            value={criticalCount} 
            unit="require immediate attention" 
            icon={AlertTriangle} 
            status={criticalCount > 0 ? "danger" : "normal"} 
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patients">
              Patients {assignedPatients.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 rounded-full">
                  {assignedPatients.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts {allAlerts.filter(a => !a.isRead).length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-danger text-white rounded-full">
                  {allAlerts.filter(a => !a.isRead).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Patient List */}
              <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
                  Assigned Patients (Real-time)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vitals</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Delay</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedPatients.map((patient) => (
                        <tr 
                          key={patient.patientId} 
                          className={`border-b border-border/50 hover:bg-muted/50 cursor-pointer ${selectedPatient?.patientId === patient.patientId ? 'bg-primary/5' : ''}`}
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <td className="py-4 px-4">
                            <p className="font-medium text-foreground">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Age: {patient.age} | {patient.roomNumber}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            {patient.vitals ? (
                              <div className="flex flex-col gap-1 text-sm">
                                <span className="flex items-center gap-1">
                                  <Droplets size={12} className="text-primary" />
                                  {patient.vitals.glucose} mg/dL
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart size={12} className="text-danger" />
                                  {patient.vitals.heartRate} BPM
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No data</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${getRiskBg(patient.mlPrediction?.riskLevel)} ${getRiskColor(patient.mlPrediction?.riskLevel)}`}>
                              {patient.mlPrediction?.riskLevel || "Unknown"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock size={14} />
                              {patient.delaySeconds < 60 
                                ? `${patient.delaySeconds}s` 
                                : `${Math.floor(patient.delaySeconds / 60)}m`}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(patient);
                              }}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {assignedPatients.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No patients assigned to you yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected Patient Detail */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                  Patient Details
                </h2>
                {selectedPatient ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{selectedPatient.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedPatient.condition}</p>
                      </div>
                    </div>

                    <LiveDelayIndicator
                      lastUpdated={selectedPatient.lastUpdated}
                      delaySeconds={selectedPatient.delaySeconds}
                      isConnected={selectedPatient.isConnected}
                    />

                    {selectedPatient.vitals && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Current Vitals</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Droplets size={12} />
                              Glucose
                            </div>
                            <p className="font-semibold text-foreground">{selectedPatient.vitals.glucose} mg/dL</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Heart size={12} />
                              Heart Rate
                            </div>
                            <p className="font-semibold text-foreground">{selectedPatient.vitals.heartRate} BPM</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Thermometer size={12} />
                              Temperature
                            </div>
                            <p className="font-semibold text-foreground">{selectedPatient.vitals.temperature.toFixed(1)}°C</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Activity size={12} />
                              SpO2
                            </div>
                            <p className="font-semibold text-foreground">{selectedPatient.vitals.spo2}%</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPatient.mlPrediction && (
                      <div className={`p-3 rounded-lg ${getRiskBg(selectedPatient.mlPrediction.riskLevel)}`}>
                        <h3 className="text-sm font-medium text-foreground mb-1">ML Analysis</h3>
                        <p className={`text-sm ${getRiskColor(selectedPatient.mlPrediction.riskLevel)}`}>
                          Risk Level: {selectedPatient.mlPrediction.riskLevel.toUpperCase()}
                        </p>
                        {selectedPatient.mlPrediction.analysis && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedPatient.mlPrediction.analysis}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedPatient.alerts.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Alerts</h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedPatient.alerts.slice(0, 3).map(alert => (
                            <div key={alert.id} className="flex items-center gap-2 text-sm">
                              <span className={`w-2 h-2 rounded-full ${alert.type === "critical" ? "bg-danger" : "bg-warning"}`} />
                              <span className="text-foreground truncate">{alert.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a patient to view details
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
                  <Bell size={20} className="text-danger" />
                  All Patient Alerts
                </h2>
                <span className="px-3 py-1 bg-danger/10 text-danger text-sm font-medium rounded-full">
                  {allAlerts.filter(a => !a.isRead).length} unread
                </span>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {allAlerts.length > 0 ? (
                  allAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <span className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${alert.type === "critical" ? "bg-danger" : "bg-warning"}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{alert.message}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Patient: {(alert as any).patientName || "Unknown"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active alerts
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  Patient Reports
                </h2>
                <Button variant="outline">
                  <TrendingUp size={16} className="mr-2" />
                  Generate Report
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Summary Stats */}
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h3 className="font-medium text-foreground mb-4">Overall Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Patients</span>
                      <span className="font-semibold text-foreground">{assignedPatients.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connected Devices</span>
                      <span className="font-semibold text-foreground">
                        {assignedPatients.filter(p => p.isConnected).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Critical Alerts Today</span>
                      <span className="font-semibold text-danger">{criticalCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Warning Alerts Today</span>
                      <span className="font-semibold text-warning">{warningCount}</span>
                    </div>
                  </div>
                </div>

                {/* Patient Status Summary */}
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h3 className="font-medium text-foreground mb-4">Patient Status Distribution</h3>
                  <div className="space-y-3">
                    {["critical", "high", "medium", "low"].map(level => {
                      const count = assignedPatients.filter(p => p.mlPrediction?.riskLevel === level).length;
                      const percentage = assignedPatients.length > 0 ? (count / assignedPatients.length) * 100 : 0;
                      return (
                        <div key={level}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize text-muted-foreground">{level} Risk</span>
                            <span className="font-medium text-foreground">{count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                level === "critical" ? "bg-danger" : 
                                level === "high" ? "bg-warning" : 
                                level === "medium" ? "bg-yellow-500" : 
                                "bg-success"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
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
