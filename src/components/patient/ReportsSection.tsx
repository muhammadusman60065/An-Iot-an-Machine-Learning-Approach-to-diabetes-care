import React, { useState } from 'react';
import { FileText, Download, TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HistoricalReading } from '@/hooks/usePatientDashboard';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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
  <motion.div
    className="bg-muted/50 rounded-xl p-4"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05, y: -2 }}
    transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        {trend === 'up' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <TrendingUp className="w-3 h-3 text-destructive" />
          </motion.div>
        )}
        {trend === 'down' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <TrendingDown className="w-3 h-3 text-success" />
          </motion.div>
        )}
      </div>
    </div>
    <motion.div 
      className="flex items-baseline gap-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </motion.div>
  </motion.div>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
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
          <FileText className="w-6 h-6 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Reports & Statistics</h2>
          <p className="text-sm text-muted-foreground">Summary of your health data</p>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Daily Summary */}
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  24-Hour Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.length === 0 ? (
                  <motion.div 
                    className="text-center py-6 text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    No data available for the last 24 hours
                  </motion.div>
                ) : (
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
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
                      trend="up"
                    />
                    <StatCard
                      label="Min Glucose"
                      value={stats.minGlucose.toFixed(0)}
                      unit="mg/dL"
                      icon={<TrendingDown className="w-4 h-4 text-green-500" />}
                      trend="down"
                    />
                    <StatCard
                      label="Total Readings"
                      value={stats.readingsCount.toString()}
                      unit="readings"
                      icon={<Calendar className="w-4 h-4 text-primary" />}
                    />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Export Data */}
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.p 
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Download your health data as a CSV file for record keeping or sharing with your healthcare provider.
                  </motion.p>
                  
                  <motion.div 
                    className="flex gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {(['24h', '7d', '30d'] as const).map((range) => (
                      <motion.button
                        key={range}
                        onClick={() => setExportRange(range)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          exportRange === range
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={false}
                      >
                        {range === '24h' ? 'Last 24h' : range === '7d' ? '7 Days' : '30 Days'}
                      </motion.button>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={exportToCSV} 
                        disabled={isExporting || data.length === 0}
                        className="w-full relative overflow-hidden group"
                      >
                        <motion.span
                          className="absolute inset-0 bg-white/20"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                        <span className="relative flex items-center justify-center">
                          {isExporting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="rounded-full h-4 w-4 border-b-2 border-white mr-2"
                              />
                              Exporting...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download CSV
                            </>
                          )}
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default ReportsSection;
