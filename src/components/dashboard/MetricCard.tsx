import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      className="metric-card bg-card"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div
          className={`w-12 h-12 ${statusColors[status].bg} rounded-xl flex items-center justify-center`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className={`w-6 h-6 ${statusColors[status].icon}`} />
        </motion.div>
        {trend && trendValue && TrendIcon && (
          <motion.div
            className={`flex items-center gap-1 ${trendColors[trend]} text-sm font-medium`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <TrendIcon size={16} />
            <span>{trendValue}</span>
          </motion.div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <motion.div
          className="flex items-baseline gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-3xl font-bold font-heading text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </motion.div>
      </div>

      {lastUpdated && (
        <motion.p
          className="text-xs text-muted-foreground mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Last updated: {lastUpdated}
        </motion.p>
      )}

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <motion.div
          className={`w-2 h-2 rounded-full ${status === 'normal' ? 'bg-success' : status === 'warning' ? 'bg-warning' : 'bg-danger'}`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
};

export default MetricCard;
