// Sensor reading from IoT devices
export interface SensorReading {
  userId: string;
  timestamp: number;
  glucose: number;
  heartRate: number;
  temperature: number;
  deviceId?: string;
}

// Patient information
export interface Patient {
  id: string;
  name: string;
  age: number;
  email?: string;
  doctorId?: string;
  lastReading?: SensorReading;
}

// Health alert
export interface HealthAlert {
  id: string;
  userId: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  metric?: string;
  value?: number;
}

// Health thresholds based on medical standards
export const HEALTH_THRESHOLDS = {
  glucose: {
    criticalLow: 54,
    low: 70,
    normal: { min: 70, max: 130 },
    high: 180,
    criticalHigh: 250,
  },
  heartRate: {
    criticalLow: 40,
    low: 60,
    normal: { min: 60, max: 100 },
    high: 100,
    criticalHigh: 120,
  },
  temperature: {
    criticalLow: 35.0,
    low: 36.1,
    normal: { min: 36.1, max: 37.2 },
    high: 37.5,
    criticalHigh: 38.5,
  },
};

export type HealthStatus = "normal" | "warning" | "critical";

export interface AnomalyResult {
  status: HealthStatus;
  glucoseStatus: HealthStatus;
  heartRateStatus: HealthStatus;
  temperatureStatus: HealthStatus;
  issues: string[];
  timestamp: number;
}
