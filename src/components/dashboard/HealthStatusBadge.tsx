import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { getStatusLabel } from "@/lib/anomalyDetection";
import type { HealthStatus } from "@/lib/anomalyDetection";

interface HealthStatusBadgeProps {
  status: HealthStatus;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const HealthStatusBadge = ({
  status,
  showIcon = true,
  size = "md",
  animated = true,
}: HealthStatusBadgeProps) => {
  const statusConfig = {
    normal: { bg: "bg-success", text: "text-success-foreground", icon: CheckCircle },
    warning: { bg: "bg-warning", text: "text-warning-foreground", icon: AlertTriangle },
    critical: { bg: "bg-danger", text: "text-danger-foreground", icon: XCircle },
  };

  const sizeConfig = {
    sm: { padding: "px-2 py-0.5", text: "text-xs", icon: 12 },
    md: { padding: "px-3 py-1", text: "text-sm", icon: 14 },
    lg: { padding: "px-4 py-2", text: "text-base", icon: 18 },
  };

  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizes.padding} ${sizes.text} ${animated && status === "critical" ? "animate-pulse" : ""}`}>
      {showIcon && <Icon size={sizes.icon} />}
      <span>{getStatusLabel(status)}</span>
    </div>
  );
};

export default HealthStatusBadge;
