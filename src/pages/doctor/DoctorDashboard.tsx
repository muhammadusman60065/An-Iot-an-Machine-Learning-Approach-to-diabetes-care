import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import DiabetesChatbot from "@/components/chatbot/DiabetesChatbot";
import DoctorOverview from "@/components/doctor/DoctorOverview";
import DoctorPatients from "@/components/doctor/DoctorPatients";
import DoctorAlerts from "@/components/doctor/DoctorAlerts";
import DoctorAppointments from "@/components/doctor/DoctorAppointments";
import DoctorSettings from "@/components/doctor/DoctorSettings";

const DoctorDashboard = () => {
  const { userData } = useAuth();
  const location = useLocation();

  // Determine which section to render based on the current route
  const renderSection = () => {
    const path = location.pathname;
    
    if (path.includes('/doctor/patients')) {
      return <DoctorPatients userData={userData} />;
    }
    if (path.includes('/doctor/alerts')) {
      return <DoctorAlerts userData={userData} />;
    }
    if (path.includes('/doctor/appointments')) {
      return <DoctorAppointments userData={userData} />;
    }
    if (path.includes('/doctor/settings')) {
      return <DoctorSettings userData={userData} />;
    }
    // Default: dashboard overview
    return <DoctorOverview userData={userData} />;
  };

  return (
    <DashboardLayout role="doctor">
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </div>
      <DiabetesChatbot />
    </DashboardLayout>
  );
};

export default DoctorDashboard;
