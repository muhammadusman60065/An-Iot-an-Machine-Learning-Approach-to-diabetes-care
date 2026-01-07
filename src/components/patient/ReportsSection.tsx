import React, { useState } from 'react';
import { FileText, Download, TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HistoricalReading } from '@/hooks/usePatientDashboard';
import { format } from 'date-fns';

interface ReportsSectionProps {
  data: HistoricalReading[];
  patientName: string;
  patientId: string;
}

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, trend }) => (
  <div className="bg-muted/50 rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {icon}
        {trend === 'up' && <TrendingUp className="w-3 h-3 text-destructive" />}
        {trend === 'down' && <TrendingDown className="w-3 h-3 text-success" />}
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
  </div>
);

export const ReportsSection: React.FC<ReportsSectionProps> = ({ data, patientName, patientId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportRange, setExportRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Calculate statistics
  const calcStats = () => {
    if (data.length === 0) {
      return {
        avgTemp: 0,
        avgHR: 0,
        avgSpO2: 0,
        avgGlucose: 0,
        maxTemp: 0,
        minTemp: 0,
        maxHR: 0,
        minHR: 0,
        maxGlucose: 0,
        minGlucose: 0,
        readingsCount: 0,
      };
    }

    const temps = data.map(d => d.temperature).filter(t => t > 0);
    const hrs = data.map(d => d.heartRate).filter(h => h > 0);
    const spo2s = data.map(d => d.spO2).filter(s => s > 0);
    const glucoses = data.map(d => d.glucose).filter(g => g > 0);

    return {
      avgTemp: temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0,
      avgHR: hrs.length > 0 ? hrs.reduce((a, b) => a + b, 0) / hrs.length : 0,
      avgSpO2: spo2s.length > 0 ? spo2s.reduce((a, b) => a + b, 0) / spo2s.length : 0,
      avgGlucose: glucoses.length > 0 ? glucoses.reduce((a, b) => a + b, 0) / glucoses.length : 0,
      maxTemp: temps.length > 0 ? Math.max(...temps) : 0,
      minTemp: temps.length > 0 ? Math.min(...temps) : 0,
      maxHR: hrs.length > 0 ? Math.max(...hrs) : 0,
      minHR: hrs.length > 0 ? Math.min(...hrs) : 0,
      maxGlucose: glucoses.length > 0 ? Math.max(...glucoses) : 0,
      minGlucose: glucoses.length > 0 ? Math.min(...glucoses) : 0,
      readingsCount: data.length,
    };
  };

  const stats = calcStats();

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      if (data.length === 0) {
        alert('No data available for export');
        return;
      }

      let csvContent = 'Date,Time,Temperature (°C),Heart Rate (BPM),SpO2 (%),Glucose (mg/dL),Humidity (%)\n';

      data.forEach((reading) => {
        const date = new Date(reading.timestamp * 1000);
        const row = [
          format(date, 'yyyy-MM-dd'),
          format(date, 'HH:mm:ss'),
          reading.temperature.toFixed(1),
          reading.heartRate.toFixed(0),
          reading.spO2.toFixed(0),
          reading.glucose.toFixed(0),
          reading.humidity.toFixed(1),
        ].join(',');
        csvContent += row + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${patientName}_vitals_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Reports & Statistics</h2>
          <p className="text-sm text-muted-foreground">Summary of your health data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              24-Hour Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No data available for the last 24 hours
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard
                  label="Avg Temperature"
                  value={stats.avgTemp.toFixed(1)}
                  unit="°C"
                  icon={<Activity className="w-4 h-4 text-red-500" />}
                />
                <StatCard
                  label="Avg Heart Rate"
                  value={stats.avgHR.toFixed(0)}
                  unit="BPM"
                  icon={<Activity className="w-4 h-4 text-pink-500" />}
                />
                <StatCard
                  label="Avg SpO₂"
                  value={stats.avgSpO2.toFixed(0)}
                  unit="%"
                  icon={<Activity className="w-4 h-4 text-blue-500" />}
                />
                <StatCard
                  label="Max Glucose"
                  value={stats.maxGlucose.toFixed(0)}
                  unit="mg/dL"
                  icon={<TrendingUp className="w-4 h-4 text-purple-500" />}
                />
                <StatCard
                  label="Min Glucose"
                  value={stats.minGlucose.toFixed(0)}
                  unit="mg/dL"
                  icon={<TrendingDown className="w-4 h-4 text-green-500" />}
                />
                <StatCard
                  label="Total Readings"
                  value={stats.readingsCount.toString()}
                  unit="readings"
                  icon={<Calendar className="w-4 h-4 text-primary" />}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download your health data as a CSV file for record keeping or sharing with your healthcare provider.
              </p>
              
              <div className="flex gap-2">
                {(['24h', '7d', '30d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setExportRange(range)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      exportRange === range
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {range === '24h' ? 'Last 24h' : range === '7d' ? '7 Days' : '30 Days'}
                  </button>
                ))}
              </div>

              <Button 
                onClick={exportToCSV} 
                disabled={isExporting || data.length === 0}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ReportsSection;
