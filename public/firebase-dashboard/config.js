/**
 * Firebase Configuration
 * =====================
 * 
 * PASTE YOUR API KEY BELOW on line 13 (replace YOUR_API_KEY_HERE)
 * 
 * To get your API key:
 * 1. Go to Firebase Console (https://console.firebase.google.com)
 * 2. Select your project → Project settings
 * 3. Scroll to "Your apps" → Web app → Copy apiKey
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",  // <-- PASTE YOUR API KEY HERE
  authDomain: "diabetes-monitoring-fyp.firebaseapp.com",
  databaseURL: "https://diabetes-monitoring-fyp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "diabetes-monitoring-fyp",
  storageBucket: "diabetes-monitoring-fyp.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:placeholder"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
  console.log('📍 Database URL:', firebaseConfig.databaseURL);
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Get database reference
const database = firebase.database();

// Export for use in other files
window.firebaseDB = database;

/**
 * ===========================================
 * FIREBASE REALTIME DATABASE RULES
 * ===========================================
 * Copy these rules to Firebase Console:
 * Firebase Console → Realtime Database → Rules
 * 
 * For DEMO/TESTING (open access):
 * {
 *   "rules": {
 *     ".read": true,
 *     ".write": true
 *   }
 * }
 * 
 * For PRODUCTION (secure):
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
 *           ".indexOn": ["timestamp"]
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
 *         },
 *         "device": {
 *           ".read": true,
 *           ".write": true
 *         }
 *       }
 *     }
 *   }
 * }
 */
