// User types
export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  uid: string;
  name: string;
  email: string;
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
  emergencyContact?: string;
  medicalHistory?: string;
}

// Vitals types
export interface Vitals {
  temperature: number;
  humidity: number;
  heartRate: number;
  spO2: number;
  glucose: number;
  timestamp: string | number;
}

// Device status types
export interface DeviceStatus {
  deviceConnected: boolean;
  max30100_online: boolean;
  rssi: number;
  lastUpdate?: string | number;
}

// Alert types
export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id?: string;
  active: boolean;
  message: string;
  timestamp: string | number;
  severity: AlertSeverity;
  type?: string;
  acknowledged?: boolean;
}

export interface PatientAlerts {
  active: boolean;
  messages: Alert[];
}

// Patient data types
export interface PatientData {
  info?: {
    name: string;
    age?: number;
    gender?: string;
    bloodType?: string;
  };
  vitals?: Vitals;
  status?: DeviceStatus;
  alerts?: PatientAlerts;
  history?: Record<string, Vitals>;
}

// Chart data types
export interface ChartDataPoint {
  time: string;
  value: number;
  label?: string;
}

export interface VitalsChartData {
  heartRate: ChartDataPoint[];
  spO2: ChartDataPoint[];
  glucose: ChartDataPoint[];
  temperature: ChartDataPoint[];
}

// Firebase references types
export interface FirebaseRefs {
  sensors: string;
  patients: string;
  alerts: string;
  users: string;
  assignments: string;
}

// Doctor-Patient Assignment
export interface DoctorPatientAssignment {
  doctorId: string;
  patientId: string;
  assignedAt: string;
}

// ML Prediction types
export interface MLPrediction {
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  prediction: string;
  timestamp: string | number;
}

// Anomaly detection types
export interface AnomalyResult {
  isAnomaly: boolean;
  type: string;
  severity: AlertSeverity;
  value: number;
  threshold: {
    min: number;
    max: number;
  };
}
