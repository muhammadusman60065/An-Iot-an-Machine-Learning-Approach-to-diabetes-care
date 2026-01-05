// User Types
export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  patientId?: string;
  assignedPatients?: string[];
  profile?: UserProfile;
}

export interface UserProfile {
  avatar?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  bloodType?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
}

// Vitals Types
export interface Vitals {
  temperature: number;
  humidity: number;
  heartRate: number;
  spO2: number;
  glucose: number;
  timestamp: string | number;
}

export interface VitalsReading extends Vitals {
  id?: string;
  patientId?: string;
}

export interface VitalsHistory {
  readings: VitalsReading[];
  lastUpdated: string;
}

// Device Status Types
export interface DeviceStatus {
  deviceConnected: boolean;
  max30100_online: boolean;
  rssi: number;
  lastSeen?: string;
  firmwareVersion?: string;
  batteryLevel?: number;
}

// Alert Types
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertType = "glucose" | "heartRate" | "temperature" | "spO2" | "device" | "system";

export interface Alert {
  id?: string;
  active: boolean;
  message: string;
  timestamp: string | number;
  severity: AlertSeverity;
  type?: AlertType;
  patientId?: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface AlertConfig {
  glucose: { min: number; max: number };
  heartRate: { min: number; max: number };
  temperature: { min: number; max: number };
  spO2: { min: number };
}

// Patient Types
export interface Patient {
  id: string;
  userId: string;
  name: string;
  email: string;
  vitals?: Vitals;
  status?: DeviceStatus;
  alerts?: Alert[];
  assignedDoctor?: string;
  createdAt: string;
}

// Doctor Types
export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialization?: string;
  assignedPatients: string[];
  createdAt: string;
}

// Appointment Types
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no-show";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName?: string;
  doctorName?: string;
  date: string;
  time: string;
  duration: number;
  type: "checkup" | "followup" | "emergency" | "consultation";
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface VitalsChartData {
  temperature: ChartDataPoint[];
  heartRate: ChartDataPoint[];
  spO2: ChartDataPoint[];
  glucose: ChartDataPoint[];
}

// Dashboard Stats Types
export interface DashboardStats {
  totalPatients: number;
  activeAlerts: number;
  averageGlucose: number;
  averageHeartRate: number;
  deviceOnline: number;
  deviceOffline: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Firebase Realtime Database Structure
export interface FirebaseDBStructure {
  users: Record<string, User>;
  patients: Record<string, Patient>;
  sensors: Record<string, Vitals>;
  alerts: Record<string, Alert>;
  appointments: Record<string, Appointment>;
  assignments: Record<string, Record<string, { assignedAt: string }>>;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: string;
}

// Settings Types
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  alertThresholds: AlertConfig;
  theme: "light" | "dark" | "system";
  language: string;
}
