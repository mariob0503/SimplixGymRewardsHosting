// Display Fallback Script - Used when normal Firebase auth fails
// This provides direct database access for displays

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { signInAnonymously, getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import firebaseConfig from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

/**
 * Initializes a display with direct database access
 * @param {string} displayId - The ID of the display
 * @returns {Promise<{db: object, ref: Function, displayRef: object}>}
 */
export async function initializeDisplay(displayId) {
  console.log("Initializing display with fallback method:", displayId);
  
  // Format display ID
  if (!displayId.startsWith('display_')) {
    displayId = 'display_' + displayId;
  }
  
  // Try anonymous auth first
  try {
    const userCred = await signInAnonymously(auth);
    console.log("Anonymous authentication successful:", userCred.user.uid);
  } catch (error) {
    console.warn("Anonymous authentication failed:", error);
    // Continue without auth - rules should allow reading display data
  }
  
  // Create a reference to this display in the database
  const displayRef = ref(db, `displays/${displayId}`);
  
  return {
    db,
    ref,
    displayRef,
    
    // Convenience method to set display content
    async setContent(content) {
      try {
        await set(displayRef, {
          content,
          lastUpdated: serverTimestamp(),
          status: 'online',
          fallbackAccess: true
        });
        console.log("Display content updated via fallback method");
        return true;
      } catch (error) {
        console.error("Failed to update display content:", error);
        return false;
      }
    },
    
    // Set up a listener for content updates
    onContentChange(callback) {
      return onValue(displayRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          callback(data);
        } else {
          console.log("No data available for this display");
          callback(null);
        }
      });
    }
  };
} 