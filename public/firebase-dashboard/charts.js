/**
 * Charts Module
 * =============
 * Real-time Chart.js charts for patient vitals
 * Updates automatically when new data arrives from Firebase
 */

// Chart instances (global for updates)
let tempHumidityChart = null;
let heartRateChart = null;
let spo2Chart = null;
let glucoseChart = null;

// Chart configuration defaults
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300 // Smooth but quick updates
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#94a3b8',
        usePointStyle: true,
        padding: 15
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#94a3b8',
      borderColor: '#334155',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        color: 'rgba(51, 65, 85, 0.5)',
        drawBorder: false
      },
      ticks: {
        color: '#64748b',
        maxRotation: 45,
        font: { size: 10 }
      }
    },
    y: {
      display: true,
      grid: {
        color: 'rgba(51, 65, 85, 0.5)',
        drawBorder: false
      },
      ticks: {
        color: '#64748b',
        font: { size: 10 }
      }
    }
  }
};

/**
 * Initialize all charts with empty data
 */
function initializeCharts() {
  // Temperature & Humidity Chart (dual axis)
  const tempHumidityCtx = document.getElementById('tempHumidityChart').getContext('2d');
  tempHumidityChart = new Chart(tempHumidityCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Temperature (°C)',
          data: [],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Humidity (%)',
          data: [],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          position: 'left',
          title: {
            display: true,
            text: 'Temp (°C)',
            color: '#ef4444'
          },
          min: 30,
          max: 45
        },
        y1: {
          ...chartDefaults.scales.y,
          position: 'right',
          title: {
            display: true,
            text: 'Humidity (%)',
            color: '#3b82f6'
          },
          min: 20,
          max: 100,
          grid: { drawOnChartArea: false }
        }
      }
    }
  });

  // Heart Rate Chart
  const heartRateCtx = document.getElementById('heartRateChart').getContext('2d');
  heartRateChart = new Chart(heartRateCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Heart Rate (BPM)',
        data: [],
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.15)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#f43f5e'
      }]
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          min: 40,
          max: 140,
          title: {
            display: true,
            text: 'BPM',
            color: '#f43f5e'
          }
        }
      }
    }
  });

  // SpO2 Chart
  const spo2Ctx = document.getElementById('spo2Chart').getContext('2d');
  spo2Chart = new Chart(spo2Ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'SpO2 (%)',
        data: [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#10b981'
      }]
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          min: 85,
          max: 100,
          title: {
            display: true,
            text: '%',
            color: '#10b981'
          }
        }
      }
    }
  });

  // Glucose Chart
  const glucoseCtx = document.getElementById('glucoseChart').getContext('2d');
  glucoseChart = new Chart(glucoseCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Glucose (mg/dL)',
        data: [],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#8b5cf6'
      }]
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          min: 50,
          max: 300,
          title: {
            display: true,
            text: 'mg/dL',
            color: '#8b5cf6'
          }
        }
      }
    }
  });

  console.log('📊 Charts initialized');
}

/**
 * Update charts with new history data
 * @param {Array} historyData - Array of historical readings
 */
function updateCharts(historyData) {
  if (!historyData || historyData.length === 0) {
    console.log('No history data to display');
    return;
  }

  // Sort by timestamp (oldest first)
  const sortedData = [...historyData].sort((a, b) => {
    const timeA = a.timestamp || 0;
    const timeB = b.timestamp || 0;
    return timeA - timeB;
  });

  // Format labels (time only)
  const labels = sortedData.map(d => {
    if (!d.timestamp) return '--';
    const date = new Date(d.timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  });

  // Extract values
  const temperatures = sortedData.map(d => d.temperature || null);
  const humidities = sortedData.map(d => d.humidity || null);
  const heartRates = sortedData.map(d => d.heartRate || null);
  const spo2Values = sortedData.map(d => d.spO2 || null);
  const glucoseValues = sortedData.map(d => d.glucose || null);

  // Update Temperature & Humidity Chart
  if (tempHumidityChart) {
    tempHumidityChart.data.labels = labels;
    tempHumidityChart.data.datasets[0].data = temperatures;
    tempHumidityChart.data.datasets[1].data = humidities;
    tempHumidityChart.update('none'); // No animation for real-time
  }

  // Update Heart Rate Chart
  if (heartRateChart) {
    heartRateChart.data.labels = labels;
    heartRateChart.data.datasets[0].data = heartRates;
    heartRateChart.update('none');
  }

  // Update SpO2 Chart
  if (spo2Chart) {
    spo2Chart.data.labels = labels;
    spo2Chart.data.datasets[0].data = spo2Values;
    spo2Chart.update('none');
  }

  // Update Glucose Chart
  if (glucoseChart) {
    glucoseChart.data.labels = labels;
    glucoseChart.data.datasets[0].data = glucoseValues;
    glucoseChart.update('none');
  }

  console.log(`📊 Charts updated with ${sortedData.length} data points`);
}

/**
 * Add a single new data point to charts (real-time update)
 * @param {Object} reading - New vital reading
 */
function addDataPoint(reading) {
  const time = new Date(reading.timestamp || Date.now()).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const MAX_POINTS = 50;

  // Helper to add and trim
  const addPoint = (chart, newLabel, newValues) => {
    if (!chart) return;
    
    chart.data.labels.push(newLabel);
    newValues.forEach((val, i) => {
      chart.data.datasets[i].data.push(val);
    });

    // Keep only last N points
    if (chart.data.labels.length > MAX_POINTS) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(ds => ds.data.shift());
    }

    chart.update('none');
  };

  addPoint(tempHumidityChart, time, [reading.temperature, reading.humidity]);
  addPoint(heartRateChart, time, [reading.heartRate]);
  addPoint(spo2Chart, time, [reading.spO2]);
  addPoint(glucoseChart, time, [reading.glucose]);
}

/**
 * Clear all chart data
 */
function clearCharts() {
  [tempHumidityChart, heartRateChart, spo2Chart, glucoseChart].forEach(chart => {
    if (chart) {
      chart.data.labels = [];
      chart.data.datasets.forEach(ds => ds.data = []);
      chart.update('none');
    }
  });
  console.log('📊 Charts cleared');
}

// Export functions
window.chartFunctions = {
  initializeCharts,
  updateCharts,
  addDataPoint,
  clearCharts
};
