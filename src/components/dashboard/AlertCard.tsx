import { AlertTriangle, Info, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertCardProps {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
  actionLabel?: string;
}

const AlertCard = ({
  id,
  type,
  title,
  message,
  timestamp,
  isRead = false,
  onDismiss,
  onAction,
  actionLabel,
}: AlertCardProps) => {
  const typeConfig = {
    critical: {
      icon: XCircle,
      bg: "bg-danger-light",
      border: "border-danger/30",
      iconColor: "text-danger",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-warning-light",
      border: "border-warning/30",
      iconColor: "text-warning",
    },
    info: {
      icon: Info,
      bg: "bg-info-light",
      border: "border-info/30",
      iconColor: "text-info",
    },
    success: {
      icon: CheckCircle,
      bg: "bg-success-light",
      border: "border-success/30",
      iconColor: "text-success",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`relative p-4 rounded-xl border ${config.border} ${config.bg} ${
        !isRead ? "ring-2 ring-primary/20" : ""
      } transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-foreground">{title}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>{timestamp}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>

          {(onAction || onDismiss) && (
            <div className="flex items-center gap-2 mt-3">
              {onAction && (
                <Button size="sm" variant="default" onClick={() => onAction(id)}>
                  {actionLabel || "View Details"}
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={() => onDismiss(id)}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {!isRead && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />
      )}
    </div>
  );
};

export default AlertCard;
