import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientDashboard } from "@/hooks/usePatientDashboard";
import VitalsSection from "@/components/patient/VitalsSection";
import VitalsCharts from "@/components/patient/VitalsCharts";
import AlertsSection from "@/components/patient/AlertsSection";
import ReportsSection from "@/components/patient/ReportsSection";
import SettingsSection from "@/components/patient/SettingsSection";
import AssignedDoctor from "@/components/patient/AssignedDoctor";
import DiabetesChatbot from "@/components/chatbot/DiabetesChatbot";
import { Loader2, User, Activity, Bell, FileText, Settings, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
console.log("AlertsSection", AlertsSection);
// Map routes to tab values
const routeToTab: Record<string, string> = {
  "/patient/dashboard": "overview",
  "/patient/health-data": "overview",
  "/patient/doctor": "doctor",
  "/patient/alerts": "alerts",
  "/patient/reports": "reports",
  "/patient/settings": "settings",
};

// Map tab values to routes
const tabToRoute: Record<string, string> = {
  overview: "/patient/dashboard",
  doctor: "/patient/doctor",
  alerts: "/patient/alerts",
  reports: "/patient/reports",
  settings: "/patient/settings",
};

const PatientDashboard = () => {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  console.log(userData);
  // Derive initial tab from current route
  const getTabFromRoute = (pathname: string): string => {
    return routeToTab[pathname] || "overview";
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromRoute(location.pathname));

  // Sync tab state when route changes (e.g., from sidebar clicks)
  useEffect(() => {
    const newTab = getTabFromRoute(location.pathname);
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname]);

  // Handle tab changes - update URL to match
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const targetRoute = tabToRoute[value];
    if (targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  };

  // Get patientId from userData
  const patientId =
    userData?.patientId || (userData?.role === "patient" && userData.email ? userData.email.split("@")[0] : null);

  const { vitals, status, currentAlert, alertHistory, history24h, isConnected, lastUpdated, loading } =
    usePatientDashboard(patientId);

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <motion.div
          className="flex items-center justify-center min-h-[60vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4" />
            </motion.div>
            <motion.p
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Loading your health data...
            </motion.p>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <DashboardLayout role="patient">
      <motion.div
        className="space-y-6 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.header
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card rounded-xl p-6 shadow-card border border-border/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.01 }}
        >
          <motion.div
            className="flex items-center gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shadow-lg"
              variants={itemVariants}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Welcome back, {userData?.name || "Patient"}
              </h1>
              <p className="text-muted-foreground">Your personal health monitoring dashboard</p>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${isConnected ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"}`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-success" : "bg-destructive"}`}
                animate={
                  isConnected
                    ? {
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1],
                      }
                    : {}
                }
                transition={
                  isConnected
                    ? {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    : {}
                }
              />
              <span className={`text-sm font-medium ${isConnected ? "text-success" : "text-destructive"}`}>
                {isConnected ? "Device Connected" : "Device Offline"}
              </span>
            </motion.div>
          </motion.div>
        </motion.header>

        {/* Navigation Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start bg-card border border-border/50 p-1 h-auto flex-wrap gap-1">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 data-[state=active]:gradient-bg data-[state=active]:text-white"
                >
                  <Activity className="w-4 h-4" />
                  <span>Overview</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <TabsTrigger
                  value="alerts"
                  className="flex items-center gap-2 data-[state=active]:gradient-bg data-[state=active]:text-white"
                >
                  <Bell className="w-4 h-4" />
                  <span>Alerts</span>
                  {currentAlert?.active && (
                    <motion.span
                      className="w-2 h-2 bg-destructive rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.7, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <TabsTrigger
                  value="reports"
                  className="flex items-center gap-2 data-[state=active]:gradient-bg data-[state=active]:text-white"
                >
                  <FileText className="w-4 h-4" />
                  <span>Health Reports</span>
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2 data-[state=active]:gradient-bg data-[state=active]:text-white"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </motion.div>
            </TabsList>

            {/* Overview Tab - Main Dashboard */}
            <AnimatePresence mode="wait">
              <TabsContent value="overview" className="space-y-8 mt-6" key="overview">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Section 1: Real-Time Vitals */}
                  <VitalsSection vitals={vitals} status={status} isConnected={isConnected} lastUpdated={lastUpdated} />

                  {/* Section 2: 24-Hour Charts */}
                  <VitalsCharts data={history24h} />
                </motion.div>
              </TabsContent>

              {/* Alerts Tab */}
              <TabsContent value="alerts" className="mt-6" key="alerts">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertsSection currentAlert={currentAlert} alertHistory={alertHistory} />
                </motion.div>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="mt-6" key="reports">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReportsSection
                    data={history24h}
                    patientName={userData?.name || "Patient"}
                    patientId={patientId || ""}
                  />
                </motion.div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6" key="settings">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsSection
                    patientName={userData?.name || ""}
                    patientEmail={(userData?.email || "", userData?.assignedDoctor || "")}
                  />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </motion.div>

      <DiabetesChatbot />
    </DashboardLayout>
  );
};

export default PatientDashboard;
