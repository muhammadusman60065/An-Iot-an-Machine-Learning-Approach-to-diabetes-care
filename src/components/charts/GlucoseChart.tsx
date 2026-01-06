import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface GlucoseReading {
  timestamp: string | number;
  glucose: number;
}

interface GlucoseChartProps {
  data: GlucoseReading[];
  showGradient?: boolean;
}

export const GlucoseChart: React.FC<GlucoseChartProps> = ({ data, showGradient = true }) => {
  // Format data for chart - take last 10 readings
  const chartData = data
    .slice(-10)
    .map((reading) => ({
      time: formatTime(reading.timestamp),
      glucose: reading.glucose,
      timestamp: reading.timestamp
    }));

  const minGlucose = Math.min(...chartData.map(d => d.glucose), 70);
  const maxGlucose = Math.max(...chartData.map(d => d.glucose), 140);

  if (chartData.length === 0) {
    return (
      <div className="bg-background rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Glucose Trends</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No glucose data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Glucose Trends</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">Normal (70-140)</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {showGradient ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                domain={[minGlucose - 10, maxGlucose + 10]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Normal range reference area */}
              <Area
                type="monotone"
                dataKey="glucose"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#glucoseGradient)"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                domain={[minGlucose - 10, maxGlucose + 10]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="glucose"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
        <StatItem 
          label="Current" 
          value={`${chartData[chartData.length - 1]?.glucose || '--'} mg/dL`}
        />
        <StatItem 
          label="Average" 
          value={`${Math.round(chartData.reduce((a, b) => a + b.glucose, 0) / chartData.length)} mg/dL`}
        />
        <StatItem 
          label="Readings" 
          value={`${chartData.length}`}
        />
      </div>
    </div>
  );
};

// Helper function to format timestamp
function formatTime(timestamp: string | number): string {
  if (typeof timestamp === 'number') {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  return new Date(timestamp).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isNormal = data.glucose >= 70 && data.glucose <= 140;
    
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm text-muted-foreground">{data.time}</p>
        <p className={`text-lg font-bold ${isNormal ? 'text-foreground' : 'text-destructive'}`}>
          {data.glucose} mg/dL
        </p>
        {!isNormal && (
          <p className="text-xs text-destructive">Outside normal range</p>
        )}
      </div>
    );
  }
  return null;
};

// Stat Item Component
const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-semibold text-foreground">{value}</p>
  </div>
);
