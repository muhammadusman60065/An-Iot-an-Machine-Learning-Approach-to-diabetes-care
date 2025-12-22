import { useState, useEffect } from "react";
import { Users, Activity, Server, AlertTriangle, TrendingUp, Database, Cpu, Wifi, Loader2, Mail, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import HealthChart from "@/components/dashboard/HealthChart";
import SimulatedDataBanner from "@/components/dashboard/SimulatedDataBanner";
import { Button } from "@/components/ui/button";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers, UserData } from "@/lib/firebase";

const AdminDashboard = () => {
  const { patients, alerts, isLoading, isSimulated } = useFirebaseData();
  const { userData } = useAuth();
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const patientCount = allUsers.filter(u => u.role === "patient").length;
  const doctorCount = allUsers.filter(u => u.role === "doctor").length;
  const adminCount = allUsers.filter(u => u.role === "admin").length;

  const userBreakdown = [
    { role: "Patients", count: patientCount, color: "bg-primary" },
    { role: "Doctors", count: doctorCount, color: "bg-info" },
    { role: "Admins", count: adminCount, color: "bg-warning" },
  ];
  const totalUsers = allUsers.length;

  const mockSystemActivity = [
    { time: "00:00", value: 45 }, { time: "04:00", value: 32 }, { time: "08:00", value: 78 },
    { time: "12:00", value: 95 }, { time: "16:00", value: 88 }, { time: "20:00", value: 72 }, { time: "24:00", value: 56 },
  ];

  const activityIcons: Record<string, React.ElementType> = { user: Users, device: Wifi, alert: AlertTriangle, system: Server };
  const activityColors: Record<string, string> = { user: "bg-primary-light text-primary", device: "bg-success-light text-success", alert: "bg-warning-light text-warning", system: "bg-info-light text-info" };

  const roleColors: Record<string, string> = {
    patient: "bg-primary text-white",
    doctor: "bg-info text-white",
    admin: "bg-warning text-white",
  };

  if (isLoading || usersLoading) {
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
        <SimulatedDataBanner isSimulated={isSimulated} />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
              Welcome, {userData?.name || "Admin"}
            </h1>
            <p className="text-muted-foreground mt-1">Monitor and manage the DiabetesCare platform</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline"><Database size={18} className="mr-2" />Backup Data</Button>
            <Button><TrendingUp size={18} className="mr-2" />Generate Report</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Users" value={totalUsers} unit="registered" icon={Users} trend="up" trendValue={`+${totalUsers}`} status="normal" />
          <MetricCard title="Active IoT Devices" value={isSimulated ? 6 : 89} unit="online" icon={Cpu} trend="up" trendValue="+5" status="normal" />
          <MetricCard title="System Health" value={99.8} unit="%" icon={Activity} trend="stable" trendValue="Optimal" status="normal" />
          <MetricCard title="Pending Alerts" value={alerts.filter((a) => !a.isRead).length} unit="unresolved" icon={AlertTriangle} status={alerts.length > 0 ? "warning" : "normal"} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">User Distribution</h2>
            <div className="space-y-4">
              {userBreakdown.map((item) => (
                <div key={item.role}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{item.role}</span>
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: totalUsers > 0 ? `${(item.count / totalUsers) * 100}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">{totalUsers} users</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <HealthChart title="System Activity (24h)" data={mockSystemActivity} color="hsl(174, 72%, 40%)" unit="requests/min" />
          </div>
        </div>

        {/* Registered Users List */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-semibold text-foreground">All Registered Users</h2>
            <span className="px-3 py-1 bg-primary-light text-primary text-sm font-medium rounded-full">
              {allUsers.length} users
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
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
                  </tr>
                ))}
                {allUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No users registered yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success-light rounded-xl">
                <div className="flex items-center gap-3"><Server className="w-5 h-5 text-success" /><span className="font-medium">Firebase Server</span></div>
                <span className="px-2 py-1 bg-success text-success-foreground text-xs rounded-full">Online</span>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl ${isSimulated ? "bg-warning-light" : "bg-success-light"}`}>
                <div className="flex items-center gap-3"><Database className={`w-5 h-5 ${isSimulated ? "text-warning" : "text-success"}`} /><span className="font-medium">Real-time Database</span></div>
                <span className={`px-2 py-1 text-xs rounded-full ${isSimulated ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}`}>{isSimulated ? "Simulated" : "Synced"}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-success-light rounded-xl">
                <div className="flex items-center gap-3"><Cpu className="w-5 h-5 text-success" /><span className="font-medium">ML Pipeline</span></div>
                <span className="px-2 py-1 bg-success text-success-foreground text-xs rounded-full">Active</span>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl ${isSimulated ? "bg-warning-light" : "bg-success-light"}`}>
                <div className="flex items-center gap-3"><Wifi className={`w-5 h-5 ${isSimulated ? "text-warning" : "text-success"}`} /><span className="font-medium">IoT Gateway</span></div>
                <span className={`px-2 py-1 text-xs rounded-full ${isSimulated ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}`}>{isSimulated ? "Demo Mode" : "Online"}</span>
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

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">Your Account</h2>
            {userData && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-warning flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{userData.name}</p>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                    <span className="inline-block mt-1 px-3 py-1 text-xs rounded-full bg-warning text-white capitalize">
                      {userData.role}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground">Account Created</p>
                    <p className="text-sm font-medium text-foreground">{new Date(userData.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="text-sm font-medium text-foreground truncate">{userData.uid.slice(0, 12)}...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
