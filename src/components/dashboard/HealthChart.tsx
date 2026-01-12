import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";

interface DataPoint {
  time: string;
  value: number;
}

interface HealthChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  unit: string;
  showArea?: boolean;
  minValue?: number;
  maxValue?: number;
  normalRange?: { min: number; max: number };
}

const HealthChart = ({
  title,
  data,
  color = "hsl(174, 72%, 40%)",
  unit,
  showArea = true,
  minValue,
  maxValue,
  normalRange,
}: HealthChartProps) => {
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isNormal = normalRange
        ? value >= normalRange.min && value <= normalRange.max
        : true;

      return (
        <motion.div
          className="bg-card border border-border rounded-lg p-3 shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-lg font-bold ${isNormal ? "text-foreground" : "text-warning"}`}>
            {value} {unit}
          </p>
          {normalRange && (
            <p className="text-xs text-muted-foreground mt-1">
              Normal: {normalRange.min} - {normalRange.max} {unit}
            </p>
          )}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="bg-card rounded-2xl p-6 shadow-card"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
    >
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="font-heading font-semibold text-foreground">{title}</h3>
        {normalRange && (
          <div className="text-xs text-muted-foreground">
            Normal: {normalRange.min} - {normalRange.max} {unit}
          </div>
        )}
      </motion.div>

      <motion.div
        className="h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {showArea ? (
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                domain={[minValue || "auto", maxValue || "auto"]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                domain={[minValue || "auto", maxValue || "auto"]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default HealthChart;
