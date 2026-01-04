import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PatientAlert } from "@/hooks/useRealtimePatient";

interface AlertsPanelProps {
  alerts: PatientAlert[];
  onDismiss?: (alertId: string) => void;
  maxHeight?: string;
}

const alertStyles = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: "text-red-500",
    text: "text-red-400",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: "text-amber-500",
    text: "text-amber-400",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: "text-blue-500",
    text: "text-blue-400",
  },
};

const AlertIcon = ({ type }: { type: "critical" | "warning" | "info" }) => {
  switch (type) {
    case "critical":
      return <AlertTriangle className="w-4 h-4" />;
    case "warning":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
};

export const AlertsPanel = ({ alerts, onDismiss, maxHeight = "400px" }: AlertsPanelProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <AlertCircle className="w-12 h-12 mb-2 opacity-30" />
        <p className="text-sm">No active alerts</p>
        <p className="text-xs opacity-60">All vitals are within normal range</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-4">
      <div className="space-y-2">
        {alerts.map((alert) => {
          const styles = alertStyles[alert.type];
          
          return (
            <div
              key={alert.id}
              className={cn(
                "relative rounded-lg border p-3 transition-all duration-200",
                styles.bg,
                styles.border,
                !alert.isRead && "ring-1 ring-offset-1 ring-offset-background",
                alert.type === "critical" && "animate-pulse"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5", styles.icon)}>
                  <AlertIcon type={alert.type} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm", styles.text)}>
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(alert.timestamp)}</span>
                    <span className="opacity-50">|</span>
                    <span className="capitalize">{alert.metric}</span>
                    <span className="opacity-50">•</span>
                    <span>Value: {alert.value.toFixed(1)}</span>
                  </div>
                </div>

                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-60 hover:opacity-100"
                    onClick={() => onDismiss(alert.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Unread indicator */}
              {!alert.isRead && (
                <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
