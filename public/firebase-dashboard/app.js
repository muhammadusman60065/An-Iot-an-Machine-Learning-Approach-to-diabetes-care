/**
 * IoT Patient Monitoring Dashboard - Main Application
 * ====================================================
 * Real-time Firebase integration with live updates
 * No placeholder data - everything from Firebase
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
let activeListeners = [];  // Track listeners for cleanup
let lastVitals = null;

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

/**
 * Determine vital status based on thresholds
 * @returns {'normal'|'warning'|'critical'}
 */
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

/**
 * Update connection status UI
 */
function setConnectionStatus(status, message) {
  const statusDot = elements.connectionStatus.querySelector('.status-dot');
  const statusText = elements.connectionStatus.querySelector('.status-text');
  
  statusDot.className = 'status-dot ' + status;
  statusText.textContent = message;
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp) {
  if (!timestamp) return '--';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Update last update time display
 */
function updateLastUpdateTime() {
  elements.lastUpdateTime.textContent = `Last update: ${formatTime(Date.now())}`;
}

// ============================================
// Firebase Data Operations
// ============================================

/**
 * Load all patients and populate dropdown
 */
async function loadPatients() {
  try {
    const patientsRef = firebaseDB.ref('patients');
    
    patientsRef.once('value', (snapshot) => {
      const patients = snapshot.val();
      elements.patientSelect.innerHTML = '';
      
      if (!patients) {
        elements.patientSelect.innerHTML = '<option value="">No patients found</option>';
        console.log('⚠️ No patients in database. Add patient data to: patients/{patientId}/');
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
        option.textContent = patient.info?.name || `Patient ${patientId}`;
        elements.patientSelect.appendChild(option);
      });

      console.log(`✅ Loaded ${Object.keys(patients).length} patients`);
      
      // Auto-select first patient if available
      if (Object.keys(patients).length > 0) {
        const firstPatientId = Object.keys(patients)[0];
        elements.patientSelect.value = firstPatientId;
        selectPatient(firstPatientId);
      }
    });
  } catch (error) {
    console.error('Error loading patients:', error);
    setConnectionStatus('error', 'Error loading patients');
  }
}

/**
 * Clean up existing listeners before setting new ones
 */
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

/**
 * Select a patient and start real-time listeners
 */
function selectPatient(patientId) {
  if (!patientId) {
    console.log('No patient selected');
    return;
  }

  // Cleanup previous listeners
  cleanupListeners();
  
  currentPatientId = patientId;
  console.log(`👤 Selected patient: ${patientId}`);
  
  // Clear charts
  if (window.chartFunctions) {
    window.chartFunctions.clearCharts();
  }

  // Set up real-time listeners
  listenToVitals(patientId);
  listenToHistory(patientId);
  listenToAlerts(patientId);
  listenToDeviceStatus(patientId);

  setConnectionStatus('connected', 'Connected');
}

/**
 * Listen to real-time vitals updates
 * Firebase path: patients/{patientId}/vitals
 */
function listenToVitals(patientId) {
  const vitalsRef = firebaseDB.ref(`patients/${patientId}/vitals`);
  
  const unsubscribe = vitalsRef.on('value', (snapshot) => {
    const vitals = snapshot.val();
    
    if (!vitals) {
      console.log('No vitals data available');
      return;
    }

    console.log('📡 Vitals update received:', vitals);
    updateVitalsDisplay(vitals);
    
    // Save to history if this is a new reading
    if (vitals.timestamp !== lastVitals?.timestamp) {
      saveToHistory(patientId, vitals);
      lastVitals = vitals;
    }
    
    updateLastUpdateTime();
  }, (error) => {
    console.error('Error listening to vitals:', error);
    setConnectionStatus('error', 'Connection error');
  });

  activeListeners.push(() => vitalsRef.off('value', unsubscribe));
}

/**
 * Listen to history for charts
 * Firebase path: patients/{patientId}/history
 */
function listenToHistory(patientId) {
  const historyRef = firebaseDB.ref(`patients/${patientId}/history`)
    .orderByChild('timestamp')
    .limitToLast(MAX_HISTORY_POINTS);
  
  const unsubscribe = historyRef.on('value', (snapshot) => {
    const historyData = snapshot.val();
    
    if (!historyData) {
      console.log('No history data available');
      return;
    }

    // Convert object to array
    const historyArray = Object.values(historyData);
    console.log(`📊 History loaded: ${historyArray.length} points`);
    
    // Update charts
    if (window.chartFunctions) {
      window.chartFunctions.updateCharts(historyArray);
    }
  }, (error) => {
    console.error('Error listening to history:', error);
  });

  activeListeners.push(() => historyRef.off('value', unsubscribe));
}

/**
 * Listen to alerts
 * Firebase path: patients/{patientId}/alerts
 */
function listenToAlerts(patientId) {
  const alertsRef = firebaseDB.ref(`patients/${patientId}/alerts`);
  
  const unsubscribe = alertsRef.on('value', (snapshot) => {
    const alerts = snapshot.val();
    updateAlertsDisplay(alerts);
  }, (error) => {
    console.error('Error listening to alerts:', error);
  });

  activeListeners.push(() => alertsRef.off('value', unsubscribe));
}

/**
 * Listen to device status
 */
function listenToDeviceStatus(patientId) {
  const deviceRef = firebaseDB.ref(`patients/${patientId}/device`);
  
  const unsubscribe = deviceRef.on('value', (snapshot) => {
    const device = snapshot.val();
    updateDeviceDisplay(device);
  });

  activeListeners.push(() => deviceRef.off('value', unsubscribe));
}

/**
 * Save current vitals to history
 * Creates a new entry at: patients/{patientId}/history/{pushId}
 */
function saveToHistory(patientId, vitals) {
  if (!vitals) return;

  const historyRef = firebaseDB.ref(`patients/${patientId}/history`);
  const newEntry = {
    temperature: vitals.temperature || null,
    humidity: vitals.humidity || null,
    heartRate: vitals.heartRate || null,
    spO2: vitals.spO2 || null,
    glucose: vitals.glucose || null,
    timestamp: vitals.timestamp || Date.now()
  };

  historyRef.push(newEntry)
    .then(() => {
      console.log('📝 Saved to history');
    })
    .catch(error => {
      console.error('Error saving to history:', error);
    });
}

// ============================================
// UI Update Functions
// ============================================

/**
 * Update vital cards with new data
 */
function updateVitalsDisplay(vitals) {
  // Temperature
  if (vitals.temperature !== undefined) {
    elements.tempValue.textContent = vitals.temperature.toFixed(1);
    const tempStatus = getVitalStatus(vitals.temperature, VITAL_THRESHOLDS.temperature);
    elements.tempStatus.className = `vital-status ${tempStatus}`;
    elements.tempCard.classList.toggle('alert', tempStatus === 'critical');
  }

  // Humidity
  if (vitals.humidity !== undefined) {
    elements.humidityValue.textContent = vitals.humidity.toFixed(0);
    const humidityStatus = getVitalStatus(vitals.humidity, VITAL_THRESHOLDS.humidity);
    elements.humidityStatus.className = `vital-status ${humidityStatus}`;
  }

  // Heart Rate
  if (vitals.heartRate !== undefined) {
    elements.heartRateValue.textContent = Math.round(vitals.heartRate);
    const hrStatus = getVitalStatus(vitals.heartRate, VITAL_THRESHOLDS.heartRate);
    elements.heartRateStatus.className = `vital-status ${hrStatus}`;
    elements.heartRateCard.classList.toggle('alert', hrStatus === 'critical');
  }

  // SpO2
  if (vitals.spO2 !== undefined) {
    elements.spo2Value.textContent = vitals.spO2.toFixed(0);
    const spo2Status = getVitalStatus(vitals.spO2, VITAL_THRESHOLDS.spO2);
    elements.spo2Status.className = `vital-status ${spo2Status}`;
    elements.spo2Card.classList.toggle('alert', spo2Status === 'critical');
  }

  // Glucose
  if (vitals.glucose !== undefined) {
    elements.glucoseValue.textContent = Math.round(vitals.glucose);
    const glucoseStatus = getVitalStatus(vitals.glucose, VITAL_THRESHOLDS.glucose);
    elements.glucoseStatus.className = `vital-status ${glucoseStatus}`;
    elements.glucoseCard.classList.toggle('alert', glucoseStatus === 'critical');
  }

  // Generate alerts for critical values
  checkAndCreateAlerts(vitals);
}

/**
 * Update alerts display
 */
function updateAlertsDisplay(alerts) {
  if (!alerts || Object.keys(alerts).length === 0) {
    elements.alertsContainer.innerHTML = '<div class="no-alerts">✅ No active alerts - All vitals normal</div>';
    return;
  }

  let alertsHTML = '';
  
  Object.entries(alerts).forEach(([alertId, alert]) => {
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

  elements.alertsContainer.innerHTML = alertsHTML;
}

/**
 * Update device status display
 */
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

/**
 * Check vitals and create alerts for critical values
 */
function checkAndCreateAlerts(vitals) {
  if (!currentPatientId) return;

  const alerts = {};
  const timestamp = Date.now();

  // Check each vital
  if (vitals.temperature) {
    const status = getVitalStatus(vitals.temperature, VITAL_THRESHOLDS.temperature);
    if (status === 'critical') {
      alerts[`temp_${timestamp}`] = {
        type: 'critical',
        message: `Critical temperature: ${vitals.temperature.toFixed(1)}°C`,
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
        message: `Critical SpO2: ${vitals.spO2.toFixed(0)}%`,
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
        message: `Critical glucose: ${Math.round(vitals.glucose)} mg/dL`,
        metric: 'glucose',
        value: vitals.glucose,
        timestamp
      };
    }
  }

  // Save new alerts to Firebase
  if (Object.keys(alerts).length > 0) {
    const alertsRef = firebaseDB.ref(`patients/${currentPatientId}/alerts`);
    alertsRef.update(alerts);
  }
}

/**
 * Dismiss an alert
 */
window.dismissAlert = function(alertId) {
  if (!currentPatientId) return;
  
  const alertRef = firebaseDB.ref(`patients/${currentPatientId}/alerts/${alertId}`);
  alertRef.remove()
    .then(() => console.log('Alert dismissed'))
    .catch(error => console.error('Error dismissing alert:', error));
};

// ============================================
// Event Listeners
// ============================================

// Patient selection change
elements.patientSelect.addEventListener('change', (e) => {
  selectPatient(e.target.value);
});

// Refresh button
elements.refreshBtn.addEventListener('click', () => {
  if (currentPatientId) {
    selectPatient(currentPatientId);
  } else {
    loadPatients();
  }
});

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Dashboard initializing...');
  
  // Initialize charts
  if (window.chartFunctions) {
    window.chartFunctions.initializeCharts();
  }

  // Monitor Firebase connection
  const connectedRef = firebaseDB.ref('.info/connected');
  connectedRef.on('value', (snapshot) => {
    if (snapshot.val() === true) {
      setConnectionStatus('connected', 'Connected to Firebase');
      console.log('🔥 Connected to Firebase');
    } else {
      setConnectionStatus('error', 'Disconnected');
      console.log('❌ Disconnected from Firebase');
    }
  });

  // Load patients
  loadPatients();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  cleanupListeners();
});

console.log('📱 App.js loaded');
