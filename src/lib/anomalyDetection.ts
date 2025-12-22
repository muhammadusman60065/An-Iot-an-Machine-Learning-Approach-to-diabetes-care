// Health Types
export interface SensorReading {
  userId: string;
  timestamp: number;
  glucose: number;
  heartRate: number;
  temperature: number;
  deviceId?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  email?: string;
  doctorId?: string;
  lastReading?: SensorReading;
}

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

export type HealthStatus = "normal" | "warning" | "critical";

export interface AnomalyResult {
  status: HealthStatus;
  glucoseStatus: HealthStatus;
  heartRateStatus: HealthStatus;
  temperatureStatus: HealthStatus;
  issues: string[];
  timestamp: number;
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

// Analyze individual metric
function analyzeMetric(
  value: number,
  thresholds: typeof HEALTH_THRESHOLDS.glucose,
  metricName: string
): { status: HealthStatus; issue: string | null } {
  if (value <= thresholds.criticalLow) {
    return { status: "critical", issue: `Critically low ${metricName}: ${value}` };
  }
  if (value >= thresholds.criticalHigh) {
    return { status: "critical", issue: `Critically high ${metricName}: ${value}` };
  }
  if (value < thresholds.low || value > thresholds.high) {
    return { status: "warning", issue: `Abnormal ${metricName}: ${value}` };
  }
  return { status: "normal", issue: null };
}

// Main anomaly detection function
export function detectAnomalies(reading: SensorReading): AnomalyResult {
  const issues: string[] = [];

  const glucoseAnalysis = analyzeMetric(reading.glucose, HEALTH_THRESHOLDS.glucose, "glucose level");
  const heartRateAnalysis = analyzeMetric(reading.heartRate, HEALTH_THRESHOLDS.heartRate, "heart rate");
  const temperatureAnalysis = analyzeMetric(reading.temperature, HEALTH_THRESHOLDS.temperature, "body temperature");

  if (glucoseAnalysis.issue) issues.push(glucoseAnalysis.issue);
  if (heartRateAnalysis.issue) issues.push(heartRateAnalysis.issue);
  if (temperatureAnalysis.issue) issues.push(temperatureAnalysis.issue);

  const statuses = [glucoseAnalysis.status, heartRateAnalysis.status, temperatureAnalysis.status];
  let overallStatus: HealthStatus = "normal";
  if (statuses.includes("critical")) overallStatus = "critical";
  else if (statuses.includes("warning")) overallStatus = "warning";

  return {
    status: overallStatus,
    glucoseStatus: glucoseAnalysis.status,
    heartRateStatus: heartRateAnalysis.status,
    temperatureStatus: temperatureAnalysis.status,
    issues,
    timestamp: reading.timestamp || Date.now(),
  };
}

// Generate alert from anomaly detection
export function generateAlert(reading: SensorReading, anomaly: AnomalyResult): HealthAlert | null {
  if (anomaly.status === "normal") return null;

  return {
    id: `alert-${Date.now()}`,
    userId: reading.userId,
    type: anomaly.status === "critical" ? "critical" : "warning",
    title: anomaly.status === "critical" ? "Critical Health Alert" : "Health Warning Detected",
    message: anomaly.issues.join(". "),
    timestamp: Date.now(),
    isRead: false,
    metric: anomaly.issues[0]?.split(":")[0] || "health",
    value: reading.glucose,
  };
}

// Get status label
export function getStatusLabel(status: HealthStatus): string {
  switch (status) {
    case "critical": return "Critical";
    case "warning": return "Warning";
    default: return "Normal";
  }
}
