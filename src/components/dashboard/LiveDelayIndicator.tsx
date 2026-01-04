import { Clock, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveDelayIndicatorProps {
  lastUpdated: string | null;
  delaySeconds: number;
  isConnected: boolean;
  isSimulated?: boolean;
  className?: string;
}

const LiveDelayIndicator = ({
  lastUpdated,
  delaySeconds,
  isConnected,
  isSimulated = false,
  className,
}: LiveDelayIndicatorProps) => {
  const getDelayStatus = () => {
    if (!isConnected) return "disconnected";
    if (delaySeconds < 5) return "live";
    if (delaySeconds < 30) return "recent";
    if (delaySeconds < 60) return "delayed";
    return "stale";
  };

  const status = getDelayStatus();

  const statusConfig = {
    live: {
      bg: "bg-success/10",
      border: "border-success/30",
      text: "text-success",
      label: "Live",
      pulse: true,
    },
    recent: {
      bg: "bg-success/10",
      border: "border-success/30",
      text: "text-success",
      label: `${delaySeconds}s ago`,
      pulse: false,
    },
    delayed: {
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
      label: `${delaySeconds}s ago`,
      pulse: false,
    },
    stale: {
      bg: "bg-danger/10",
      border: "border-danger/30",
      text: "text-danger",
      label: delaySeconds >= 60 ? `${Math.floor(delaySeconds / 60)}m ${delaySeconds % 60}s ago` : `${delaySeconds}s ago`,
      pulse: false,
    },
    disconnected: {
      bg: "bg-muted",
      border: "border-border",
      text: "text-muted-foreground",
      label: "Disconnected",
      pulse: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border",
        config.bg,
        config.border,
        className
      )}
    >
      {isConnected ? (
        <div className="relative">
          <Wifi className={cn("w-4 h-4", config.text)} />
          {config.pulse && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-pulse" />
          )}
        </div>
      ) : (
        <WifiOff className={cn("w-4 h-4", config.text)} />
      )}
      
      <div className="flex items-center gap-1.5">
        <Clock className={cn("w-3 h-3", config.text)} />
        <span className={cn("text-xs font-medium", config.text)}>
          {config.label}
        </span>
      </div>

      {isSimulated && (
        <span className="text-xs px-1.5 py-0.5 bg-warning/20 text-warning rounded">
          Demo
        </span>
      )}
    </div>
  );
};

export default LiveDelayIndicator;
