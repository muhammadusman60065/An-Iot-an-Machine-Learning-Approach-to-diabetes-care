import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoricalReading } from '@/hooks/usePatientDashboard';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface VitalsChartsProps {
  data: HistoricalReading[];
}

interface SingleChartProps {
  data: Array<{ time: string; value: number; fullTime: string }>;
  title: string;
  color: string;
  gradientId: string;
  unit: string;
  domain?: [number, number];
}

const SingleChart: React.FC<SingleChartProps> = ({ data, title, color, gradientId, unit, domain }) => {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const latest = values[values.length - 1];
  const chartDomain = domain || [min * 0.95, max * 1.05];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-2xl font-bold" style={{ color }}>{latest?.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                domain={chartDomain}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value.toFixed(1)} ${unit}`, title]}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTime || label}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const VitalsCharts: React.FC<VitalsChartsProps> = ({ data }) => {
  // Transform data for each chart
  const formatData = (readings: HistoricalReading[], key: keyof HistoricalReading) => {
    return readings.map((reading) => {
      const date = new Date(reading.timestamp * 1000);
      return {
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        fullTime: date.toLocaleString(),
        value: reading[key] as number,
      };
    });
  };

  const temperatureData = formatData(data, 'temperature');
  const heartRateData = formatData(data, 'heartRate');
  const spO2Data = formatData(data, 'spO2');
  const glucoseData = formatData(data, 'glucose');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.section 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <TrendingUp className="w-6 h-6 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Historical data visualization</h2>
          <p className="text-sm text-muted-foreground">24-hour trends and patterns</p>
        </div>
      </motion.div>

      {data.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="py-12 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Historical Data</h3>
              <p className="text-muted-foreground">Charts will appear as your device collects readings</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <SingleChart
            data={temperatureData}
            title="Temperature"
            color="#ef4444"
            gradientId="tempGradient"
            unit="°C"
          />
          <SingleChart
            data={heartRateData}
            title="Heart Rate"
            color="#ec4899"
            gradientId="hrGradient"
            unit="BPM"
          />
          <SingleChart
            data={spO2Data}
            title="Blood Oxygen (SpO₂)"
            color="#3b82f6"
            gradientId="spo2Gradient"
            unit="%"
            domain={[90, 100]}
          />
          <SingleChart
            data={glucoseData}
            title="Glucose"
            color="#8b5cf6"
            gradientId="glucoseGradient"
            unit="mg/dL"
          />
        </motion.div>
      )}
    </motion.section>
  );
};

export default VitalsCharts;
