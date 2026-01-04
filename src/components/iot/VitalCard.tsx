import { cn } from "@/lib/utils";
import { Activity, Thermometer, Heart, Droplets, Gauge } from "lucide-react";

interface VitalCardProps {
  title: string;
  value: number;
  unit: string;
  icon: "temperature" | "heartRate" | "spo2" | "glucose" | "humidity";
  status: "normal" | "warning" | "critical";
  min?: number;
  max?: number;
}

const iconMap = {
  temperature: Thermometer,
  heartRate: Heart,
  spo2: Activity,
  glucose: Droplets,
  humidity: Gauge,
};

const statusStyles = {
  normal: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    icon: "text-emerald-500",
    pulse: "",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    icon: "text-amber-500",
    pulse: "animate-pulse",
  },
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    icon: "text-red-500",
    pulse: "animate-pulse",
  },
};

export const VitalCard = ({ title, value, unit, icon, status, min, max }: VitalCardProps) => {
  const Icon = iconMap[icon];
  const styles = statusStyles[status];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all duration-300",
        styles.bg,
        styles.border,
        styles.pulse
      )}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/50" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={cn("p-2 rounded-lg", styles.bg)}>
            <Icon className={cn("w-5 h-5", styles.icon)} />
          </div>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className={cn("text-3xl font-bold", styles.text)}>
            {value.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>

        {/* Range indicator */}
        {min !== undefined && max !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", 
                  status === "normal" ? "bg-emerald-500" : 
                  status === "warning" ? "bg-amber-500" : "bg-red-500"
                )}
                style={{
                  width: `${Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))}%`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {min}-{max}
            </span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            status === "normal" ? "bg-emerald-500" :
            status === "warning" ? "bg-amber-500" : "bg-red-500"
          )} />
        </div>
      </div>
    </div>
  );
};
