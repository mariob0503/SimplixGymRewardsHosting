// Display Debug Script
// This script can be added to help diagnose and fix display authentication issues

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { signInAnonymously, getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import firebaseConfig from './firebase-config.js';

// Create a debug window
function createDebugConsole() {
  const debugContainer = document.createElement('div');
  debugContainer.id = 'debug-console';
  debugContainer.style.position = 'fixed';
  debugContainer.style.bottom = '10px';
  debugContainer.style.right = '10px';
  debugContainer.style.width = '300px';
  debugContainer.style.height = '200px';
  debugContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  debugContainer.style.color = '#00FF00';
  debugContainer.style.padding = '10px';
  debugContainer.style.fontFamily = 'monospace';
  debugContainer.style.fontSize = '12px';
  debugContainer.style.overflow = 'auto';
  debugContainer.style.zIndex = '9999';
  debugContainer.style.borderRadius = '5px';
  debugContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  
  // Add a close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'X';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '5px';
  closeButton.style.backgroundColor = '#FF0000';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '3px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => {
    debugContainer.style.display = 'none';
  };
  
  // Add a button to fix display database
  const fixButton = document.createElement('button');
  fixButton.textContent = 'Fix Display';
  fixButton.style.position = 'absolute';
  fixButton.style.top = '5px';
  fixButton.style.left = '5px';
  fixButton.style.backgroundColor = '#0066FF';
  fixButton.style.color = 'white';
  fixButton.style.border = 'none';
  fixButton.style.borderRadius = '3px';
  fixButton.style.padding = '3px 8px';
  fixButton.style.cursor = 'pointer';
  fixButton.onclick = async () => {
    log('Attempting to fix display...');
    await runFixes();
  };
  
  // Create log area
  const logArea = document.createElement('div');
  logArea.id = 'debug-log';
  logArea.style.marginTop = '30px';
  logArea.style.height = 'calc(100% - 35px)';
  logArea.style.overflow = 'auto';
  
  // Add elements to the container
  debugContainer.appendChild(closeButton);
  debugContainer.appendChild(fixButton);
  debugContainer.appendChild(logArea);
  
  // Add to document
  document.body.appendChild(debugContainer);
  
  return logArea;
}

// Log a message to the debug console
function log(message) {
  const logArea = document.getElementById('debug-log') || createDebugConsole();
  const logEntry = document.createElement('div');
  logEntry.textContent = `[${new Date().toISOString().substr(11, 8)}] ${message}`;
  logArea.appendChild(logEntry);
  logArea.scrollTop = logArea.scrollHeight;
  console.log(message);
}

// Run fixes to resolve display issues
async function runFixes() {
  // Get display ID from localStorage or generate a new one
  let displayId = localStorage.getItem('displayId');
  if (!displayId) {
    displayId = 'display_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('displayId', displayId);
    log(`Created new display ID: ${displayId}`);
  } else {
    log(`Using existing display ID: ${displayId}`);
  }

  try {
    // Initialize Firebase
    log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig, 'debug-app');
    const db = getDatabase(app);
    const auth = getAuth(app);
    
    // Try anonymous authentication
    log('Attempting anonymous authentication...');
    try {
      const userCred = await signInAnonymously(auth);
      log(`Anonymous auth successful: ${userCred.user.uid}`);
    } catch (authError) {
      log(`Anonymous auth failed: ${authError.message}`);
    }
    
    // Test database write without auth
    log('Testing database write access...');
    try {
      const displayRef = ref(db, `displays/${displayId}`);
      await set(displayRef, {
        debug: true,
        timestamp: serverTimestamp(),
        status: 'debug_test'
      });
      log('Database write successful!');
    } catch (dbError) {
      log(`Database write failed: ${dbError.message}`);
      
      // Try to update database rules (if you have the Firebase CLI installed)
      log('Please update your database rules to:');
      log('"displays": { ".read": true, ".write": true }');
    }
    
    // Test database read
    log('Testing database read access...');
    try {
      const displayRef = ref(db, `displays/${displayId}`);
      onValue(displayRef, (snapshot) => {
        log('Database read successful!');
        log(`Data: ${JSON.stringify(snapshot.val())}`);
      }, {
        onlyOnce: true
      });
    } catch (readError) {
      log(`Database read failed: ${readError.message}`);
    }
    
    log('Fixes completed. Check console for results.');
  } catch (error) {
    log(`Error during fix: ${error.message}`);
  }
}

// Initialize debug console when script is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add a key combination to show debug console (Shift+Ctrl+D)
  document.addEventListener('keydown', (event) => {
    if (event.shiftKey && event.ctrlKey && event.key === 'D') {
      const debugConsole = document.getElementById('debug-console');
      if (debugConsole) {
        debugConsole.style.display = debugConsole.style.display === 'none' ? 'block' : 'none';
      } else {
        createDebugConsole();
        log('Debug console activated. Press Shift+Ctrl+D to toggle visibility.');
      }
    }
  });
  
  // Check if we should show the debug console immediately (via URL parameter)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
    createDebugConsole();
    log('Debug mode activated via URL parameter.');
  }
});

// Export functions for direct use
export { log, runFixes }; 