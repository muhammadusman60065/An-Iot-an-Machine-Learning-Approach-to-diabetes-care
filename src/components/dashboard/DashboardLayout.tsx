import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  FileText,
  Calendar,
  BarChart3,
  UserCog,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

type UserRole = "patient" | "doctor" | "admin";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

const navigationConfig = {
  patient: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/patient/dashboard" },
    { label: "Health Data", icon: Activity, path: "/patient/health-data" },
    { label: "Alerts", icon: Bell, path: "/patient/alerts" },
    { label: "Reports", icon: FileText, path: "/patient/reports" },
    { label: "Settings", icon: Settings, path: "/patient/settings" },
  ],
  doctor: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/doctor/dashboard" },
    { label: "Patients", icon: Users, path: "/doctor/patients" },
    { label: "Alerts", icon: Bell, path: "/doctor/alerts" },
    { label: "Appointments", icon: Calendar, path: "/doctor/appointments" },
    { label: "Settings", icon: Settings, path: "/doctor/settings" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Users", icon: UserCog, path: "/admin/users" },
    { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    { label: "System Alerts", icon: Bell, path: "/admin/alerts" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ],
};

const roleColors: Record<UserRole, string> = {
  patient: "bg-primary",
  doctor: "bg-info",
  admin: "bg-warning",
};

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, signOut } = useAuth();

  const navigation = navigationConfig[role];

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <button
        onClick={() => {
          navigate(item.path);
          setMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <Icon size={20} />
        {(sidebarOpen || mobileMenuOpen) && (
          <span className="font-medium">{item.label}</span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } hidden lg:block`}
      >
        <div className="flex flex-col h-full">
          <div className={`p-4 border-b border-border ${sidebarOpen ? "" : "flex justify-center"}`}>
            <Logo size={sidebarOpen ? "md" : "sm"} showText={sidebarOpen} />
          </div>

          {/* User Info */}
          {sidebarOpen && userData && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${roleColors[userData.role]} flex items-center justify-center`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{userData.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full capitalize ${roleColors[userData.role]} text-white`}>
                    {userData.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <div className="flex items-center justify-between px-2 py-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 ${
                !sidebarOpen && "justify-center"
              }`}
              onClick={handleLogout}
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
            </Button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-16">
          {/* User Info Mobile */}
          {userData && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${roleColors[userData.role]} flex items-center justify-center`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{userData.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full capitalize ${roleColors[userData.role]} text-white`}>
                    {userData.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`lg:transition-all lg:duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } pt-16 lg:pt-0`}
      >
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
