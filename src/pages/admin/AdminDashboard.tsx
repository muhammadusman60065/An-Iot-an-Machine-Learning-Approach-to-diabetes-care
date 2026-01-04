import { useState } from "react";
import { 
  Users, Activity, Server, AlertTriangle, TrendingUp, Database, Cpu, Wifi, 
  Loader2, Mail, User, UserPlus, UserMinus, Link2, Unlink, RefreshCw,
  Shield, Heart, Droplets, Clock
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import HealthChart from "@/components/dashboard/HealthChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminData } from "@/hooks/useAdminData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/firebase";

const AdminDashboard = () => {
  const { userData } = useAuth();
  const {
    allUsers,
    patients,
    doctors,
    admins,
    systemPatients,
    systemAlerts,
    assignments,
    totalConnectedDevices,
    criticalAlerts,
    isLoading,
    updateUser,
    removeUser,
    assignPatient,
    unassignPatient,
    refreshData,
  } = useAdminData(userData);

  const [selectedDoctorForAssign, setSelectedDoctorForAssign] = useState<string>("");
  const [selectedPatientForAssign, setSelectedPatientForAssign] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [roleChangeUser, setRoleChangeUser] = useState<{ uid: string; currentRole: UserRole } | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("patient");

  const mockSystemActivity = [
    { time: "00:00", value: 45 }, { time: "04:00", value: 32 }, { time: "08:00", value: 78 },
    { time: "12:00", value: 95 }, { time: "16:00", value: 88 }, { time: "20:00", value: 72 }, { time: "24:00", value: 56 },
  ];

  const roleColors: Record<string, string> = {
    patient: "bg-primary text-white",
    doctor: "bg-info text-white",
    admin: "bg-warning text-white",
  };

  const handleAssignPatient = async () => {
    if (!selectedDoctorForAssign || !selectedPatientForAssign) {
      toast({ title: "Error", description: "Please select both doctor and patient", variant: "destructive" });
      return;
    }
    
    setIsAssigning(true);
    try {
      await assignPatient(selectedDoctorForAssign, selectedPatientForAssign);
      toast({ title: "Success", description: "Patient assigned to doctor" });
      setSelectedDoctorForAssign("");
      setSelectedPatientForAssign("");
    } catch (err) {
      toast({ title: "Error", description: "Failed to assign patient", variant: "destructive" });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignPatient = async (doctorId: string, patientId: string) => {
    try {
      await unassignPatient(doctorId, patientId);
      toast({ title: "Success", description: "Patient unassigned from doctor" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to unassign patient", variant: "destructive" });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await removeUser(userToDelete);
      toast({ title: "Success", description: "User removed" });
      setUserToDelete(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to remove user", variant: "destructive" });
    }
  };

  const handleRoleChange = async () => {
    if (!roleChangeUser) return;
    try {
      await updateUser(roleChangeUser.uid, { role: newRole });
      toast({ title: "Success", description: "User role updated" });
      setRoleChangeUser(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading system data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
              Admin Control Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Full system management and monitoring
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
            <Button>
              <TrendingUp size={18} className="mr-2" />
              System Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Users" 
            value={allUsers.length} 
            unit="registered" 
            icon={Users} 
            status="normal" 
          />
          <MetricCard 
            title="Connected Devices" 
            value={totalConnectedDevices} 
            unit="online" 
            icon={Cpu} 
            status="normal" 
          />
          <MetricCard 
            title="System Health" 
            value={99.8} 
            unit="%" 
            icon={Activity} 
            status="normal" 
          />
          <MetricCard 
            title="Critical Alerts" 
            value={criticalAlerts} 
            unit="unresolved" 
            icon={AlertTriangle} 
            status={criticalAlerts > 0 ? "danger" : "normal"} 
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">
              Users ({allUsers.length})
            </TabsTrigger>
            <TabsTrigger value="assignments">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              Live Monitoring
            </TabsTrigger>
            <TabsTrigger value="system">
              System Status
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              {/* User Distribution */}
              <div className="grid lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{patients.length}</p>
                      <p className="text-sm text-muted-foreground">Patients</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{doctors.length}</p>
                      <p className="text-sm text-muted-foreground">Doctors</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{admins.length}</p>
                      <p className="text-sm text-muted-foreground">Admins</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{allUsers.length}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    All Registered Users
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user.uid} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${roleColors[user.role]} flex items-center justify-center`}>
                                <User size={14} />
                              </div>
                              <span className="font-medium text-foreground">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail size={14} />
                              {user.email}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${roleColors[user.role]}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setRoleChangeUser({ uid: user.uid, currentRole: user.role });
                                      setNewRole(user.role);
                                    }}
                                  >
                                    Change Role
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Change User Role</DialogTitle>
                                    <DialogDescription>
                                      Update the role for {user.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="patient">Patient</SelectItem>
                                      <SelectItem value="doctor">Doctor</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <DialogFooter>
                                    <Button onClick={handleRoleChange}>Save</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => setUserToDelete(user.uid)}
                                  >
                                    <UserMinus size={14} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete User</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete {user.name}? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setUserToDelete(null)}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Assign Patient to Doctor */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Link2 size={20} className="text-primary" />
                  Assign Patient to Doctor
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Select Doctor</label>
                    <Select value={selectedDoctorForAssign} onValueChange={setSelectedDoctorForAssign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map(doc => (
                          <SelectItem key={doc.uid} value={doc.uid}>
                            Dr. {doc.name} ({doc.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Select Patient</label>
                    <Select value={selectedPatientForAssign} onValueChange={setSelectedPatientForAssign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(patient => (
                          <SelectItem key={patient.uid} value={patient.patientId || patient.uid}>
                            {patient.name} ({patient.email})
                          </SelectItem>
                        ))}
                        {systemPatients.map(sp => (
                          <SelectItem key={sp.patientId} value={sp.patientId}>
                            {sp.name} (ESP: {sp.patientId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleAssignPatient}
                    disabled={isAssigning || !selectedDoctorForAssign || !selectedPatientForAssign}
                  >
                    {isAssigning ? <Loader2 className="animate-spin mr-2" size={16} /> : <UserPlus size={16} className="mr-2" />}
                    Assign Patient
                  </Button>
                </div>
              </div>

              {/* Current Assignments */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Users size={20} className="text-info" />
                  Current Assignments
                </h2>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {Object.entries(assignments).length > 0 ? (
                    Object.entries(assignments).map(([doctorId, patientIds]) => {
                      const doctor = doctors.find(d => d.uid === doctorId);
                      return (
                        <div key={doctorId} className="p-4 bg-muted/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-info flex items-center justify-center">
                              <Shield size={14} className="text-white" />
                            </div>
                            <span className="font-medium text-foreground">
                              Dr. {doctor?.name || doctorId}
                            </span>
                          </div>
                          <div className="space-y-2 ml-10">
                            {patientIds.map(patientId => {
                              const patient = patients.find(p => p.patientId === patientId || p.uid === patientId);
                              const sysPatient = systemPatients.find(sp => sp.patientId === patientId);
                              return (
                                <div key={patientId} className="flex items-center justify-between py-2 px-3 bg-background rounded-lg">
                                  <span className="text-sm text-foreground">
                                    {patient?.name || sysPatient?.name || patientId}
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleUnassignPatient(doctorId, patientId)}
                                  >
                                    <Unlink size={14} className="text-danger" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No assignments yet. Assign patients to doctors above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Live Monitoring Tab */}
          <TabsContent value="monitoring" className="mt-6">
            <div className="space-y-6">
              {/* System Patients */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
                  All Patient Devices (Live)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vitals</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemPatients.map((patient) => (
                        <tr key={patient.patientId} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-4 px-4 font-mono text-sm text-primary">
                            {patient.patientId}
                          </td>
                          <td className="py-4 px-4 font-medium text-foreground">
                            {patient.name}
                          </td>
                          <td className="py-4 px-4">
                            {patient.vitals ? (
                              <div className="flex gap-4 text-sm">
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
                            <span className={`px-2 py-1 text-xs rounded-full ${patient.isConnected ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                              {patient.isConnected ? "Connected" : "Offline"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {patient.lastUpdated ? new Date(patient.lastUpdated).toLocaleTimeString() : "N/A"}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {systemPatients.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No patient devices found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Alerts */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle size={20} className="text-danger" />
                    System-Wide Alerts
                  </h2>
                  <span className="px-3 py-1 bg-danger/10 text-danger text-sm font-medium rounded-full">
                    {criticalAlerts} critical
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {systemAlerts.length > 0 ? (
                    systemAlerts.slice(0, 20).map((alert) => (
                      <div key={alert.id} className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                        <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${alert.type === "critical" ? "bg-danger" : "bg-warning"}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground text-sm">{alert.message}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Patient: {alert.patientName}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No alerts in the system
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* System Status Tab */}
          <TabsContent value="system" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* System Activity Chart */}
              <div>
                <HealthChart 
                  title="System Activity (24h)" 
                  data={mockSystemActivity} 
                  color="hsl(174, 72%, 40%)" 
                  unit="requests/min" 
                />
              </div>

              {/* System Status */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6">System Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Server className="w-5 h-5 text-success" />
                      <span className="font-medium">Firebase Server</span>
                    </div>
                    <span className="px-2 py-1 bg-success text-white text-xs rounded-full">Online</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-success" />
                      <span className="font-medium">Real-time Database</span>
                    </div>
                    <span className="px-2 py-1 bg-success text-white text-xs rounded-full">Synced</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-success" />
                      <span className="font-medium">ML Pipeline</span>
                    </div>
                    <span className="px-2 py-1 bg-success text-white text-xs rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Wifi className="w-5 h-5 text-success" />
                      <span className="font-medium">IoT Gateway</span>
                    </div>
                    <span className="px-2 py-1 bg-success text-white text-xs rounded-full">
                      {totalConnectedDevices} devices
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

              {/* Admin Account Info */}
              <div className="bg-card rounded-2xl p-6 shadow-card lg:col-span-2">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6">Your Admin Account</h2>
                {userData && (
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-warning flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-foreground">{userData.name}</p>
                      <p className="text-muted-foreground">{userData.email}</p>
                      <span className="inline-block mt-2 px-4 py-1 text-sm rounded-full bg-warning text-white capitalize">
                        {userData.role}
                      </span>
                    </div>
                    <div className="ml-auto flex gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{allUsers.length}</p>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{totalConnectedDevices}</p>
                        <p className="text-sm text-muted-foreground">Devices</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-danger">{criticalAlerts}</p>
                        <p className="text-sm text-muted-foreground">Critical</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
