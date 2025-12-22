import { SensorReading, HealthAlert, HealthStatus, AnomalyResult, HEALTH_THRESHOLDS } from "@/types/health";

// Analyze individual metric
function analyzeMetric(
  value: number,
  thresholds: typeof HEALTH_THRESHOLDS.glucose,
  metricName: string
): { status: HealthStatus; issue: string | null } {
  if (value <= thresholds.criticalLow) {
    return {
      status: "critical",
      issue: `Critically low ${metricName}: ${value}`,
    };
  }
  if (value >= thresholds.criticalHigh) {
    return {
      status: "critical",
      issue: `Critically high ${metricName}: ${value}`,
    };
  }
  if (value < thresholds.low || value > thresholds.high) {
    return {
      status: "warning",
      issue: `Abnormal ${metricName}: ${value}`,
    };
  }
  return { status: "normal", issue: null };
}

// Main anomaly detection function
export function detectAnomalies(reading: SensorReading): AnomalyResult {
  const issues: string[] = [];

  // Analyze each metric
  const glucoseAnalysis = analyzeMetric(
    reading.glucose,
    HEALTH_THRESHOLDS.glucose,
    "glucose level"
  );
  const heartRateAnalysis = analyzeMetric(
    reading.heartRate,
    HEALTH_THRESHOLDS.heartRate,
    "heart rate"
  );
  const temperatureAnalysis = analyzeMetric(
    reading.temperature,
    HEALTH_THRESHOLDS.temperature,
    "body temperature"
  );

  // Collect issues
  if (glucoseAnalysis.issue) issues.push(glucoseAnalysis.issue);
  if (heartRateAnalysis.issue) issues.push(heartRateAnalysis.issue);
  if (temperatureAnalysis.issue) issues.push(temperatureAnalysis.issue);

  // Determine overall status (worst case)
  const statuses = [
    glucoseAnalysis.status,
    heartRateAnalysis.status,
    temperatureAnalysis.status,
  ];

  let overallStatus: HealthStatus = "normal";
  if (statuses.includes("critical")) {
    overallStatus = "critical";
  } else if (statuses.includes("warning")) {
    overallStatus = "warning";
  }

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
export function generateAlert(
  reading: SensorReading,
  anomaly: AnomalyResult
): HealthAlert | null {
  if (anomaly.status === "normal") return null;

  const alertType = anomaly.status === "critical" ? "critical" : "warning";
  const title =
    alertType === "critical"
      ? "Critical Health Alert"
      : "Health Warning Detected";

  return {
    id: `alert-${Date.now()}`,
    userId: reading.userId,
    type: alertType,
    title,
    message: anomaly.issues.join(". "),
    timestamp: Date.now(),
    isRead: false,
    metric: anomaly.issues[0]?.split(":")[0] || "health",
    value: reading.glucose,
  };
}

// Get status color for UI
export function getStatusColor(status: HealthStatus): string {
  switch (status) {
    case "critical":
      return "danger";
    case "warning":
      return "warning";
    default:
      return "normal";
  }
}

// Get status label
export function getStatusLabel(status: HealthStatus): string {
  switch (status) {
    case "critical":
      return "Critical";
    case "warning":
      return "Warning";
    default:
      return "Normal";
  }
}
