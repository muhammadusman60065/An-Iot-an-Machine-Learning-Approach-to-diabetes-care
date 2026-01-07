import React from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientDashboard } from "@/hooks/usePatientDashboard";
import VitalsSection from "@/components/patient/VitalsSection";
import VitalsCharts from "@/components/patient/VitalsCharts";
import AlertsSection from "@/components/patient/AlertsSection";
import ReportsSection from "@/components/patient/ReportsSection";
import DiabetesChatbot from "@/components/chatbot/DiabetesChatbot";
import { Loader2, User } from "lucide-react";

const PatientDashboard = () => {
  const { userData } = useAuth();
  
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
      <div className="space-y-8 pb-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-end flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Welcome, {userData?.name || "Patient"}
              </h1>
              <p className="text-muted-foreground">Your personal health monitoring dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
            <span className={isConnected ? 'text-success' : 'text-destructive'}>
              {isConnected ? 'Device Connected' : 'Device Offline'}
            </span>
          </div>
        </header>

        {/* Section 1: Real-Time Vitals */}
        <VitalsSection 
          vitals={vitals}
          status={status}
          isConnected={isConnected}
          lastUpdated={lastUpdated}
        />

        {/* Section 2: 24-Hour Charts */}
        <VitalsCharts data={history24h} />

        {/* Section 3: Alerts - Separate from vitals */}
        <AlertsSection 
          currentAlert={currentAlert}
          alertHistory={alertHistory}
        />

        {/* Section 4: Reports & Statistics */}
        <ReportsSection 
          data={history24h}
          patientName={userData?.name || 'Patient'}
          patientId={patientId || ''}
        />
      </div>
      
      <DiabetesChatbot />
    </DashboardLayout>
  );
};

export default PatientDashboard;
