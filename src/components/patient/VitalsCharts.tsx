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
    );
  }

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const latest = values[values.length - 1];
  const chartDomain = domain || [min * 0.95, max * 1.05];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color }}>{latest?.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
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

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">24-Hour Trends</h2>
          <p className="text-sm text-muted-foreground">Historical data visualization</p>
        </div>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Historical Data</h3>
            <p className="text-muted-foreground">Charts will appear as your device collects readings</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        </div>
      )}
    </section>
  );
};

export default VitalsCharts;
