export interface UserProfile {
  uid: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  patientId?: string;
  assignedDoctor?: string;
  assignedPatients?: string[];
  profile: {
    name: string;
    age?: number;
    gender?: string;
    condition?: string;
    contactNumber?: string;
    address?: string;
    specialization?: string;
    hospital?: string;
    licenseNumber?: string;
  };
  createdAt: string;
}

export interface Vitals {
  temperature: number;
  humidity: number;
  heartRate: number;
  spO2: number;
  glucose: number;
  timestamp: number; // Unix timestamp in milliseconds
  bloodPressure?: string;
}

export interface DeviceStatus {
  deviceConnected: boolean;
  max30100_online?: boolean;
  max30102_online?: boolean;
  rssi: number;
  lastUpdate?: string;
}

export interface Alert {
  active: boolean;
  message: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PatientData {
  vitals: Vitals;
  status: DeviceStatus;
  alerts: Alert;
}
