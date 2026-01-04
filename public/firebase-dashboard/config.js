/**
 * Firebase Configuration
 * =====================
 * Replace with your Firebase project credentials
 * 
 * To get these values:
 * 1. Go to Firebase Console (https://console.firebase.google.com)
 * 2. Select your project
 * 3. Click the gear icon → Project settings
 * 4. Scroll to "Your apps" → Web app
 * 5. Copy the config object
 */

const firebaseConfig = {
  apiKey: "AIzaSyC9ZpMm5wh3AqMche8vgddFUYCbkFjpsJQ",
  authDomain: "diabetes-monitoring-4a93a.firebaseapp.com",
  databaseURL: "https://diabetes-monitoring-4a93a-default-rtdb.firebaseio.com",
  projectId: "diabetes-monitoring-4a93a",
  storageBucket: "diabetes-monitoring-4a93a.firebasestorage.app",
  messagingSenderId: "349aborght",
  appId: "1:349609498015:web:yourappid"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database reference
const database = firebase.database();

// Export for use in other files
window.firebaseDB = database;

console.log('✅ Firebase initialized successfully');

/**
 * ===========================================
 * FIREBASE REALTIME DATABASE RULES
 * ===========================================
 * Copy these rules to Firebase Console:
 * Firebase Console → Realtime Database → Rules
 * 
 * {
 *   "rules": {
 *     "patients": {
 *       "$patientId": {
 *         "vitals": {
 *           ".read": true,
 *           ".write": true
 *         },
 *         "history": {
 *           ".read": true,
 *           ".write": true,
 *           "$historyId": {
 *             ".validate": "newData.hasChildren(['temperature', 'humidity', 'heartRate', 'spO2', 'glucose', 'timestamp'])"
 *           }
 *         },
 *         "alerts": {
 *           ".read": true,
 *           ".write": true
 *         },
 *         "ml": {
 *           ".read": true,
 *           ".write": true
 *         },
 *         "info": {
 *           ".read": true,
 *           ".write": true
 *         }
 *       }
 *     },
 *     "devices": {
 *       ".read": true,
 *       ".write": true
 *     }
 *   }
 * }
 */
