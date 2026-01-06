import React, { useState } from 'react';
import { ref, query, orderByChild, startAt, get } from 'firebase/database';
import { database } from '../lib/firebase';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

interface ExportDataProps {
  patientId: string;
  patientName: string;
}

export const ExportData: React.FC<ExportDataProps> = ({ patientId, patientName }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [range, setRange] = useState<'7days' | '30days' | 'all'>('7days');

  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      // Calculate date range
      const now = Date.now();
      const daysAgo = range === '7days' ? 7 : range === '30days' ? 30 : 365;
      const startTimestamp = Math.floor((now - (daysAgo * 24 * 60 * 60 * 1000)) / 1000);

      // Fetch data
      const historyRef = ref(database, `patients/${patientId}/history`);
      const dataQuery = query(historyRef, orderByChild('timestamp'), startAt(startTimestamp));
      const snapshot = await get(dataQuery);

      if (!snapshot.exists()) {
        alert('No data available for export');
        setIsExporting(false);
        return;
      }

      const data = snapshot.val();
      const readings = Object.values(data) as any[];

      // Create CSV content
      let csvContent = 'Date,Time,Temperature (°C),Heart Rate (BPM),SpO2 (%),Glucose (mg/dL),Humidity (%)\n';

      readings.forEach((reading) => {
        const date = new Date(reading.timestamp * 1000);
        const row = [
          format(date, 'yyyy-MM-dd'),
          format(date, 'HH:mm:ss'),
          reading.temperature?.toFixed(1) || '0',
          reading.heartRate?.toFixed(0) || '0',
          reading.spO2?.toFixed(0) || '0',
          reading.glucose?.toFixed(0) || '0',
          reading.humidity?.toFixed(1) || '0'
        ].join(',');
        csvContent += row + '\n';
      });

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${patientName}_vitals_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Download className="w-5 h-5" />
        Export Data
      </h3>

      <div className="space-y-4">
        {/* Range Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Time Range
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: '7days', label: 'Last 7 Days' },
              { value: '30days', label: 'Last 30 Days' },
              { value: 'all', label: 'All Time' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setRange(option.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  range === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToCSV}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
};
