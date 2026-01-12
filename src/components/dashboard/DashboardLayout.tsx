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
import { motion, AnimatePresence } from "framer-motion";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <motion.button
        onClick={() => {
          navigate(item.path);
          setMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
        variants={itemVariants}
        whileHover={{ scale: 1.02, x: 5 }}
        whileTap={{ scale: 0.98 }}
      >
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-primary"
            layoutId="activeNavItem"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <Icon size={20} className="relative z-10" />
        {(sidebarOpen || mobileMenuOpen) && (
          <motion.span 
            className="font-medium relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {item.label}
          </motion.span>
        )}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <motion.header 
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Logo size="sm" />
        </motion.div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-foreground/20 z-40"
            onClick={() => setMobileMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } hidden lg:block`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col h-full">
          <motion.div 
            className={`p-4 border-b border-border ${sidebarOpen ? "" : "flex justify-center"}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Logo size={sidebarOpen ? "md" : "sm"} showText={sidebarOpen} />
          </motion.div>

          {/* User Info */}
          <AnimatePresence>
            {sidebarOpen && userData && (
              <motion.div 
                className="p-4 border-b border-border overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex items-center gap-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    className={`w-10 h-10 rounded-full ${roleColors[userData.role]} flex items-center justify-center`}
                    variants={itemVariants}
                    whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <motion.p 
                      className="text-sm font-medium text-foreground truncate"
                      variants={itemVariants}
                    >
                      {userData.name}
                    </motion.p>
                    <motion.p 
                      className="text-xs text-muted-foreground truncate"
                      variants={itemVariants}
                    >
                      {userData.email}
                    </motion.p>
                    <motion.span 
                      className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full capitalize ${roleColors[userData.role]} text-white`}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      {userData.role}
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.nav 
            className="flex-1 p-4 space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {navigation.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </motion.nav>

          <motion.div 
            className="p-4 border-t border-border space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="flex items-center justify-between px-2 py-2"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 relative overflow-hidden group ${
                  !sidebarOpen && "justify-center"
                }`}
                onClick={handleLogout}
              >
                <motion.span
                  className="absolute inset-0 bg-destructive/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                <LogOut size={20} className="relative z-10" />
                {sidebarOpen && (
                  <motion.span 
                    className="relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Logout
                  </motion.span>
                )}
              </Button>
            </motion.div>
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={20} />
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            className="lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
            <div className="flex flex-col h-full pt-16">
              {/* User Info Mobile */}
              <AnimatePresence>
                {userData && (
                  <motion.div 
                    className="p-4 border-b border-border"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div 
                      className="flex items-center gap-3"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div 
                        className={`w-10 h-10 rounded-full ${roleColors[userData.role]} flex items-center justify-center`}
                        variants={itemVariants}
                        whileHover={{ scale: 1.1 }}
                      >
                        <User className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.p 
                          className="text-sm font-medium text-foreground truncate"
                          variants={itemVariants}
                        >
                          {userData.name}
                        </motion.p>
                        <motion.p 
                          className="text-xs text-muted-foreground truncate"
                          variants={itemVariants}
                        >
                          {userData.email}
                        </motion.p>
                        <motion.span 
                          className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full capitalize ${roleColors[userData.role]} text-white`}
                          variants={itemVariants}
                        >
                          {userData.role}
                        </motion.span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.nav 
                className="flex-1 p-4 space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {navigation.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </motion.nav>

              <motion.div 
                className="p-4 border-t border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 relative overflow-hidden group"
                    onClick={handleLogout}
                  >
                    <motion.span
                      className="absolute inset-0 bg-destructive/10"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                    <LogOut size={20} className="relative z-10" />
                    <span className="relative z-10">Logout</span>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        className={`lg:transition-all lg:duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } pt-16 lg:pt-0`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-4 lg:p-8">{children}</div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
