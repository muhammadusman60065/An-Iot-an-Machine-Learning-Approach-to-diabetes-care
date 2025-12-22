import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "normal" | "warning" | "danger";
  lastUpdated?: string;
}

const MetricCard = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  status = "normal",
  lastUpdated,
}: MetricCardProps) => {
  const statusColors = {
    normal: {
      bg: "bg-success-light",
      icon: "text-success",
      badge: "bg-success/10 text-success",
    },
    warning: {
      bg: "bg-warning-light",
      icon: "text-warning",
      badge: "bg-warning/10 text-warning",
    },
    danger: {
      bg: "bg-danger-light",
      icon: "text-danger",
      badge: "bg-danger/10 text-danger",
    },
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  };

  const trendColors = {
    up: "text-success",
    down: "text-danger",
    stable: "text-muted-foreground",
  };

  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <div className="metric-card bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${statusColors[status].bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${statusColors[status].icon}`} />
        </div>
        {trend && trendValue && TrendIcon && (
          <div className={`flex items-center gap-1 ${trendColors[trend]} text-sm font-medium`}>
            <TrendIcon size={16} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-heading text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-xs text-muted-foreground mt-4">
          Last updated: {lastUpdated}
        </p>
      )}

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-2 h-2 rounded-full ${status === 'normal' ? 'bg-success' : status === 'warning' ? 'bg-warning' : 'bg-danger'} animate-pulse`} />
      </div>
    </div>
  );
};

export default MetricCard;
