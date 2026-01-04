/**
 * IoT Patient Monitoring Dashboard - Main Application
 * ====================================================
 * Real-time Firebase integration with live updates
 * No placeholder data - everything from Firebase
 * 
 * Database paths:
 * - patients/{patientId}/vitals/{temperature|humidity|heartRate|spO2|glucose|timestamp}
 * - patients/{patientId}/alerts/{active|message|timestamp}
 * - patients/{patientId}/history/{pushId} (same vitals + timestamp)
 * - patients/{patientId}/ml/{riskLevel|anomaly|confidence}
 */

// ============================================
// Configuration & Thresholds
// ============================================

const VITAL_THRESHOLDS = {
  temperature: { min: 36.0, max: 37.5, criticalMin: 35.0, criticalMax: 39.0 },
  humidity: { min: 30, max: 60, criticalMin: 20, criticalMax: 80 },
  heartRate: { min: 60, max: 100, criticalMin: 40, criticalMax: 130 },
  spO2: { min: 95, max: 100, criticalMin: 90, criticalMax: 100 },
  glucose: { min: 70, max: 140, criticalMin: 50, criticalMax: 200 }
};

const MAX_HISTORY_POINTS = 50;

// ============================================
// State Management
// ============================================

let currentPatientId = null;
let activeListeners = [];
let lastVitalsTimestamp = null;

// ============================================
// DOM Elements
// ============================================

const elements = {
  connectionStatus: document.getElementById('connectionStatus'),
  lastUpdateTime: document.getElementById('lastUpdateTime'),
  patientSelect: document.getElementById('patientSelect'),
  refreshBtn: document.getElementById('refreshBtn'),
  alertsContainer: document.getElementById('alertsContainer'),
  // Vital displays
  tempValue: document.getElementById('tempValue'),
  humidityValue: document.getElementById('humidityValue'),
  heartRateValue: document.getElementById('heartRateValue'),
  spo2Value: document.getElementById('spo2Value'),
  glucoseValue: document.getElementById('glucoseValue'),
  deviceStatus: document.getElementById('deviceStatus'),
  deviceId: document.getElementById('deviceId'),
  // Status indicators
  tempStatus: document.getElementById('tempStatus'),
  humidityStatus: document.getElementById('humidityStatus'),
  heartRateStatus: document.getElementById('heartRateStatus'),
  spo2Status: document.getElementById('spo2Status'),
  glucoseStatus: document.getElementById('glucoseStatus'),
  deviceStatusIndicator: document.getElementById('deviceStatusIndicator'),
  // Cards
  tempCard: document.getElementById('tempCard'),
  heartRateCard: document.getElementById('heartRateCard'),
  spo2Card: document.getElementById('spo2Card'),
  glucoseCard: document.getElementById('glucoseCard')
};

// ============================================
// Utility Functions
// ============================================

function getVitalStatus(value, thresholds) {
  if (value === null || value === undefined) return 'normal';
  
  if (value < thresholds.criticalMin || value > thresholds.criticalMax) {
    return 'critical';
  }
  if (value < thresholds.min || value > thresholds.max) {
    return 'warning';
  }
  return 'normal';
}

function setConnectionStatus(status, message) {
  const statusDot = elements.connectionStatus.querySelector('.status-dot');
  const statusText = elements.connectionStatus.querySelector('.status-text');
  
  statusDot.className = 'status-dot ' + status;
  statusText.textContent = message;
}

function formatTime(timestamp) {
  if (!timestamp) return '--';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function updateLastUpdateTime() {
  elements.lastUpdateTime.textContent = `Last update: ${formatTime(Date.now())}`;
}

// ============================================
// Firebase Data Operations
// ============================================

function loadPatients() {
  console.log('🔄 Loading patients...');
  
  if (!window.firebaseDB) {
    console.error('❌ Firebase not initialized');
    setConnectionStatus('error', 'Firebase not initialized');
    return;
  }

  const patientsRef = window.firebaseDB.ref('patients');
  
  patientsRef.once('value')
    .then((snapshot) => {
      const patients = snapshot.val();
      elements.patientSelect.innerHTML = '';
      
      if (!patients) {
        elements.patientSelect.innerHTML = '<option value="">No patients found - Add data to patients/{patientId}/</option>';
        console.log('⚠️ No patients in database. Expected path: patients/{patientId}/');
        setConnectionStatus('connected', 'Connected - No data');
        return;
      }

      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Select a patient --';
      elements.patientSelect.appendChild(defaultOption);

      // Add each patient
      Object.keys(patients).forEach(patientId => {
        const patient = patients[patientId];
        const option = document.createElement('option');
        option.value = patientId;
        option.textContent = patient.info?.name || `Patient: ${patientId}`;
        elements.patientSelect.appendChild(option);
      });

      console.log(`✅ Loaded ${Object.keys(patients).length} patients`);
      setConnectionStatus('connected', 'Connected');
      
      // Auto-select first patient
      if (Object.keys(patients).length > 0) {
        const firstPatientId = Object.keys(patients)[0];
        elements.patientSelect.value = firstPatientId;
        selectPatient(firstPatientId);
      }
    })
    .catch((error) => {
      console.error('❌ Error loading patients:', error);
      setConnectionStatus('error', 'Error: ' + error.message);
    });
}

function cleanupListeners() {
  activeListeners.forEach(unsubscribe => {
    try {
      unsubscribe();
    } catch (e) {
      // Listener may already be removed
    }
  });
  activeListeners = [];
  console.log('🧹 Cleaned up listeners');
}

function selectPatient(patientId) {
  if (!patientId) {
    console.log('No patient selected');
    return;
  }

  cleanupListeners();
  
  currentPatientId = patientId;
  lastVitalsTimestamp = null;
  console.log(`👤 Selected patient: ${patientId}`);
  
  // Clear charts
  if (window.chartFunctions) {
    window.chartFunctions.clearCharts();
  }

  // Set up real-time listeners
  listenToVitals(patientId);
  listenToHistory(patientId);
  listenToAlerts(patientId);
  listenToMLPredictions(patientId);
  listenToDeviceStatus(patientId);

  setConnectionStatus('connected', 'Connected');
}

/**
 * Listen to real-time vitals updates
 * Firebase path: patients/{patientId}/vitals
 */
function listenToVitals(patientId) {
  const vitalsRef = window.firebaseDB.ref(`patients/${patientId}/vitals`);
  
  const callback = vitalsRef.on('value', (snapshot) => {
    const vitals = snapshot.val();
    
    if (!vitals) {
      console.log('📡 No vitals data yet at patients/' + patientId + '/vitals');
      return;
    }

    console.log('📡 Vitals update:', vitals);
    updateVitalsDisplay(vitals);
    
    // Save to history if this is a new reading (different timestamp)
    const currentTimestamp = vitals.timestamp || Date.now();
    if (currentTimestamp !== lastVitalsTimestamp) {
      saveToHistory(patientId, vitals);
      lastVitalsTimestamp = currentTimestamp;
    }
    
    updateLastUpdateTime();
  }, (error) => {
    console.error('❌ Error listening to vitals:', error);
    setConnectionStatus('error', 'Connection error');
  });

  activeListeners.push(() => vitalsRef.off('value', callback));
}

/**
 * Listen to history for charts
 * Firebase path: patients/{patientId}/history
 */
function listenToHistory(patientId) {
  const historyRef = window.firebaseDB.ref(`patients/${patientId}/history`)
    .orderByChild('timestamp')
    .limitToLast(MAX_HISTORY_POINTS);
  
  const callback = historyRef.on('value', (snapshot) => {
    const historyData = snapshot.val();
    
    if (!historyData) {
      console.log('📊 No history data yet at patients/' + patientId + '/history');
      return;
    }

    const historyArray = Object.values(historyData);
    console.log(`📊 History loaded: ${historyArray.length} points`);
    
    if (window.chartFunctions) {
      window.chartFunctions.updateCharts(historyArray);
    }
  }, (error) => {
    console.error('❌ Error listening to history:', error);
  });

  activeListeners.push(() => historyRef.off('value', callback));
}

/**
 * Listen to alerts
 * Firebase path: patients/{patientId}/alerts
 */
function listenToAlerts(patientId) {
  const alertsRef = window.firebaseDB.ref(`patients/${patientId}/alerts`);
  
  const callback = alertsRef.on('value', (snapshot) => {
    const alerts = snapshot.val();
    updateAlertsDisplay(alerts);
  }, (error) => {
    console.error('❌ Error listening to alerts:', error);
  });

  activeListeners.push(() => alertsRef.off('value', callback));
}

/**
 * Listen to ML predictions
 * Firebase path: patients/{patientId}/ml
 */
function listenToMLPredictions(patientId) {
  const mlRef = window.firebaseDB.ref(`patients/${patientId}/ml`);
  
  const callback = mlRef.on('value', (snapshot) => {
    const ml = snapshot.val();
    if (ml) {
      console.log('🤖 ML prediction update:', ml);
      updateMLDisplay(ml);
    }
  });

  activeListeners.push(() => mlRef.off('value', callback));
}

/**
 * Listen to device status
 */
function listenToDeviceStatus(patientId) {
  const deviceRef = window.firebaseDB.ref(`patients/${patientId}/device`);
  
  const callback = deviceRef.on('value', (snapshot) => {
    const device = snapshot.val();
    updateDeviceDisplay(device);
  });

  activeListeners.push(() => deviceRef.off('value', callback));
}

/**
 * Save current vitals to history
 * Creates: patients/{patientId}/history/{pushId}
 */
function saveToHistory(patientId, vitals) {
  if (!vitals) return;

  const historyRef = window.firebaseDB.ref(`patients/${patientId}/history`);
  const newEntry = {
    temperature: vitals.temperature ?? null,
    humidity: vitals.humidity ?? null,
    heartRate: vitals.heartRate ?? null,
    spO2: vitals.spO2 ?? null,
    glucose: vitals.glucose ?? null,
    timestamp: vitals.timestamp || Date.now()
  };

  historyRef.push(newEntry)
    .then(() => {
      console.log('📝 Saved to history');
    })
    .catch(error => {
      console.error('❌ Error saving to history:', error);
    });
}

// ============================================
// UI Update Functions
// ============================================

function updateVitalsDisplay(vitals) {
  // Temperature
  if (vitals.temperature !== undefined && vitals.temperature !== null) {
    elements.tempValue.textContent = Number(vitals.temperature).toFixed(1);
    const tempStatus = getVitalStatus(vitals.temperature, VITAL_THRESHOLDS.temperature);
    elements.tempStatus.className = `vital-status ${tempStatus}`;
    elements.tempCard.classList.toggle('alert', tempStatus === 'critical');
  }

  // Humidity
  if (vitals.humidity !== undefined && vitals.humidity !== null) {
    elements.humidityValue.textContent = Math.round(vitals.humidity);
    const humidityStatus = getVitalStatus(vitals.humidity, VITAL_THRESHOLDS.humidity);
    elements.humidityStatus.className = `vital-status ${humidityStatus}`;
  }

  // Heart Rate
  if (vitals.heartRate !== undefined && vitals.heartRate !== null) {
    elements.heartRateValue.textContent = Math.round(vitals.heartRate);
    const hrStatus = getVitalStatus(vitals.heartRate, VITAL_THRESHOLDS.heartRate);
    elements.heartRateStatus.className = `vital-status ${hrStatus}`;
    elements.heartRateCard.classList.toggle('alert', hrStatus === 'critical');
  }

  // SpO2
  if (vitals.spO2 !== undefined && vitals.spO2 !== null) {
    elements.spo2Value.textContent = Math.round(vitals.spO2);
    const spo2Status = getVitalStatus(vitals.spO2, VITAL_THRESHOLDS.spO2);
    elements.spo2Status.className = `vital-status ${spo2Status}`;
    elements.spo2Card.classList.toggle('alert', spo2Status === 'critical');
  }

  // Glucose
  if (vitals.glucose !== undefined && vitals.glucose !== null) {
    elements.glucoseValue.textContent = Math.round(vitals.glucose);
    const glucoseStatus = getVitalStatus(vitals.glucose, VITAL_THRESHOLDS.glucose);
    elements.glucoseStatus.className = `vital-status ${glucoseStatus}`;
    elements.glucoseCard.classList.toggle('alert', glucoseStatus === 'critical');
  }

  // Auto-generate alerts for critical values
  checkAndCreateAlerts(vitals);
}

function updateAlertsDisplay(alerts) {
  if (!alerts || Object.keys(alerts).length === 0) {
    elements.alertsContainer.innerHTML = '<div class="no-alerts">✅ No active alerts - All vitals normal</div>';
    return;
  }

  let alertsHTML = '';
  
  // Sort by timestamp (newest first)
  const sortedAlerts = Object.entries(alerts).sort((a, b) => {
    return (b[1].timestamp || 0) - (a[1].timestamp || 0);
  });

  sortedAlerts.forEach(([alertId, alert]) => {
    if (!alert.active && alert.active !== undefined) return; // Skip inactive alerts
    
    const alertType = alert.type || 'warning';
    const icon = alertType === 'critical' ? '🚨' : (alertType === 'warning' ? '⚠️' : 'ℹ️');
    
    alertsHTML += `
      <div class="alert-item ${alertType}" data-alert-id="${alertId}">
        <span class="alert-icon">${icon}</span>
        <div class="alert-content">
          <div class="alert-message">${alert.message || 'Alert'}</div>
          <div class="alert-time">${formatTime(alert.timestamp)}</div>
        </div>
        <button class="alert-dismiss" onclick="dismissAlert('${alertId}')">×</button>
      </div>
    `;
  });

  elements.alertsContainer.innerHTML = alertsHTML || '<div class="no-alerts">✅ No active alerts</div>';
}

function updateMLDisplay(ml) {
  // Update device card to show ML status if no device data
  if (ml.riskLevel) {
    const riskColors = {
      low: 'normal',
      medium: 'warning',
      high: 'critical'
    };
    const status = riskColors[ml.riskLevel.toLowerCase()] || 'normal';
    
    // Could add ML display panel here in the future
    console.log(`🤖 Risk Level: ${ml.riskLevel}, Anomaly: ${ml.anomaly}, Confidence: ${ml.confidence}`);
  }
}

function updateDeviceDisplay(device) {
  if (!device) {
    elements.deviceStatus.textContent = 'Offline';
    elements.deviceId.textContent = 'No device connected';
    elements.deviceStatusIndicator.className = 'vital-status offline';
    return;
  }

  const isOnline = device.status === 'online' || 
                   (device.lastSeen && (Date.now() - device.lastSeen) < 60000);
  
  elements.deviceStatus.textContent = isOnline ? 'Online' : 'Offline';
  elements.deviceId.textContent = device.deviceId || device.id || 'Unknown device';
  elements.deviceStatusIndicator.className = `vital-status ${isOnline ? 'normal' : 'offline'}`;
}

function checkAndCreateAlerts(vitals) {
  if (!currentPatientId) return;

  const alerts = {};
  const timestamp = Date.now();

  // Check each vital for critical values
  if (vitals.temperature) {
    const status = getVitalStatus(vitals.temperature, VITAL_THRESHOLDS.temperature);
    if (status === 'critical') {
      alerts[`temp_${timestamp}`] = {
        type: 'critical',
        active: true,
        message: `Critical temperature: ${Number(vitals.temperature).toFixed(1)}°C`,
        metric: 'temperature',
        value: vitals.temperature,
        timestamp
      };
    }
  }

  if (vitals.heartRate) {
    const status = getVitalStatus(vitals.heartRate, VITAL_THRESHOLDS.heartRate);
    if (status === 'critical') {
      alerts[`hr_${timestamp}`] = {
        type: 'critical',
        active: true,
        message: `Critical heart rate: ${Math.round(vitals.heartRate)} BPM`,
        metric: 'heartRate',
        value: vitals.heartRate,
        timestamp
      };
    }
  }

  if (vitals.spO2) {
    const status = getVitalStatus(vitals.spO2, VITAL_THRESHOLDS.spO2);
    if (status === 'critical') {
      alerts[`spo2_${timestamp}`] = {
        type: 'critical',
        active: true,
        message: `Critical SpO2: ${Math.round(vitals.spO2)}%`,
        metric: 'spO2',
        value: vitals.spO2,
        timestamp
      };
    }
  }

  if (vitals.glucose) {
    const status = getVitalStatus(vitals.glucose, VITAL_THRESHOLDS.glucose);
    if (status === 'critical') {
      alerts[`glucose_${timestamp}`] = {
        type: 'critical',
        active: true,
        message: `Critical glucose: ${Math.round(vitals.glucose)} mg/dL`,
        metric: 'glucose',
        value: vitals.glucose,
        timestamp
      };
    }
  }

  // Save new alerts to Firebase
  if (Object.keys(alerts).length > 0) {
    const alertsRef = window.firebaseDB.ref(`patients/${currentPatientId}/alerts`);
    alertsRef.update(alerts);
  }
}

/**
 * Dismiss an alert (global function for onclick)
 */
window.dismissAlert = function(alertId) {
  if (!currentPatientId || !alertId) return;
  
  const alertRef = window.firebaseDB.ref(`patients/${currentPatientId}/alerts/${alertId}`);
  alertRef.update({ active: false })
    .then(() => console.log('Alert dismissed:', alertId))
    .catch(error => console.error('Error dismissing alert:', error));
};

// ============================================
// Event Listeners
// ============================================

elements.patientSelect.addEventListener('change', (e) => {
  selectPatient(e.target.value);
});

elements.refreshBtn.addEventListener('click', () => {
  console.log('🔄 Refreshing...');
  loadPatients();
});

// ============================================
// Initialize on Page Load
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Dashboard initializing...');
  console.log('📍 Expected Firebase paths:');
  console.log('   - patients/{patientId}/vitals/{temperature|humidity|heartRate|spO2|glucose|timestamp}');
  console.log('   - patients/{patientId}/history/{pushId}');
  console.log('   - patients/{patientId}/alerts/{alertId}');
  console.log('   - patients/{patientId}/ml/{riskLevel|anomaly|confidence}');
  
  // Initialize charts
  if (window.chartFunctions) {
    window.chartFunctions.initializeCharts();
  }
  
  // Small delay to ensure Firebase is initialized
  setTimeout(() => {
    loadPatients();
  }, 500);
});

// Handle page visibility for reconnection
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentPatientId) {
    console.log('🔄 Page visible - refreshing connection');
    selectPatient(currentPatientId);
  }
});
