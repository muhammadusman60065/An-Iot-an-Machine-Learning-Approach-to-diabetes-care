import React, { useState } from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientDashboard } from "@/hooks/usePatientDashboard";
import VitalsSection from "@/components/patient/VitalsSection";
import VitalsCharts from "@/components/patient/VitalsCharts";
import AlertsSection from "@/components/patient/AlertsSection";
import ReportsSection from "@/components/patient/ReportsSection";
import AppointmentsSection from "@/components/patient/AppointmentsSection";
import SettingsSection from "@/components/patient/SettingsSection";
import DiabetesChatbot from "@/components/chatbot/DiabetesChatbot";
import { Loader2, User, Activity, Bell, Calendar, FileText, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PatientDashboard = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get patientId from userData
  const patientId = userData?.patientId || 
    (userData?.role === "patient" && userData.email 
      ? userData.email.split("@")[0] 
      : null);
  
  const {
    vitals,
    status,
    currentAlert,
    alertHistory,
    history24h,
    isConnected,
    lastUpdated,
    loading,
  } = usePatientDashboard(patientId);

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading your health data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6 pb-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card rounded-xl p-6 shadow-card border border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Welcome back, {userData?.name || "Patient"}
              </h1>
              <p className="text-muted-foreground">Your personal health monitoring dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isConnected ? 'bg-success/10 border border-success/30' : 'bg-destructive/10 border border-destructive/30'}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
              <span className={`text-sm font-medium ${isConnected ? 'text-success' : 'text-destructive'}`}>
                {isConnected ? 'Device Connected' : 'Device Offline'}
              </span>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-card border border-border/50 p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:gradient-bg data-[state=active]:text-white">
              <Activity className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2 data-[state=active]:gradient-bg data-[state=active]:text-white">
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
              {currentAlert?.active && (
                <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2 data-[state=active]:gradient-bg data-[state=active]:text-white">
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:gradient-bg data-[state=active]:text-white">
              <FileText className="w-4 h-4" />
              <span>Health Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:gradient-bg data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Main Dashboard */}
          <TabsContent value="overview" className="space-y-8 mt-6">
            {/* Section 1: Real-Time Vitals */}
            <VitalsSection 
              vitals={vitals}
              status={status}
              isConnected={isConnected}
              lastUpdated={lastUpdated}
            />

            {/* Section 2: 24-Hour Charts */}
            <VitalsCharts data={history24h} />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <AlertsSection 
              currentAlert={currentAlert}
              alertHistory={alertHistory}
            />
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-6">
            <AppointmentsSection patientId={patientId || ''} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <ReportsSection 
              data={history24h}
              patientName={userData?.name || 'Patient'}
              patientId={patientId || ''}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <SettingsSection 
              patientName={userData?.name || ''}
              patientEmail={userData?.email || ''}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <DiabetesChatbot />
    </DashboardLayout>
  );
};

export default PatientDashboard;
