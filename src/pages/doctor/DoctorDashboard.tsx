import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import DiabetesChatbot from "@/components/chatbot/DiabetesChatbot";
import DoctorOverviewSection from "@/components/doctor/DoctorOverviewSection";
import DoctorPatientsSection from "@/components/doctor/DoctorPatientsSection";
import DoctorAlertsSection from "@/components/doctor/DoctorAlertsSection";
import DoctorSettings from "@/components/doctor/DoctorSettings";

const DoctorDashboard = () => {
  const { userData } = useAuth();
  const location = useLocation();

  // Determine which section to render based on the current route
  const renderSection = () => {
    const path = location.pathname;
    
    if (path.includes('/doctor/patients')) {
      return <DoctorPatientsSection userData={userData} />;
    }
    if (path.includes('/doctor/alerts')) {
      return <DoctorAlertsSection userData={userData} />;
    }
    if (path.includes('/doctor/settings')) {
      return <DoctorSettings userData={userData} />;
    }
    // Default: dashboard overview
    return <DoctorOverviewSection userData={userData} />;
  };

  return (
    <DashboardLayout role="doctor">
      <div className="min-h-screen pb-8">
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </div>
      <DiabetesChatbot />
    </DashboardLayout>
  );
};

export default DoctorDashboard;
