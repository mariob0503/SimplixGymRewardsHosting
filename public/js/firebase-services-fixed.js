// Firebase v9+ services module
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  signInWithRedirect, 
  getRedirectResult, 
  updateProfile, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signInWithCustomToken
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import firebaseConfig from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
let analytics;

// Initialize analytics only in browser environment
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics initialization failed:", e);
  // Create a dummy analytics object
  analytics = {
    logEvent: () => {}
  };
}

// Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Display service authentication function
export async function authenticateDisplayService(displayId) {
  console.log("Authenticating display service for:", displayId);
  
  // Modify displayId to add prefix if not already present
  if (!displayId.startsWith('display_')) {
    displayId = 'display_' + displayId;
  }
  
  try {
    // Check if already authenticated
    if (auth.currentUser) {
      console.log("Already authenticated as:", auth.currentUser.uid);
      return auth.currentUser;
    }
    
    // Try anonymous authentication - this is the simplest approach
    console.log("Attempting anonymous authentication...");
    try {
      const anonymousUser = await signInAnonymously(auth);
      console.log("Anonymous auth successful:", anonymousUser.user.uid);
      
      // Try to create or update the display record in Firestore
      try {
        const displayRef = doc(db, 'displays', displayId);
        await setDoc(displayRef, {
          lastSeen: new Date().toISOString(),
          status: 'online',
          type: 'display'
        }, { merge: true });
        console.log("Display record updated in Firestore");
      } catch (firestoreError) {
        console.warn("Could not update display record in Firestore:", firestoreError);
        // Continue anyway - this is not critical
      }
      
      return anonymousUser.user;
    } catch (anonError) {
      console.error("Anonymous authentication failed:", anonError);
      
      // Try email/password as fallback
      try {
        const email = `display-${displayId}@simplix-display.local`;
        const password = `Display-${displayId}-${window.location.hostname.replace(/[^a-zA-Z0-9]/g, '')}`;
        
        console.log("Attempting email/password authentication with:", email);
        
        try {
          // Try to sign in
          const userCred = await signInWithEmailAndPassword(auth, email, password);
          console.log("Email/password authentication successful");
          return userCred.user;
        } catch (signInError) {
          // If account doesn't exist, create it
          if (signInError.code === 'auth/user-not-found') {
            console.log("Display account not found, creating new account");
            const newUserCred = await createUserWithEmailAndPassword(auth, email, password);
            
            try {
              await updateProfile(newUserCred.user, {
                displayName: `Display_${displayId}`
              });
            } catch (profileError) {
              console.warn("Could not update user profile:", profileError);
            }
            
            console.log("New display account created successfully");
            return newUserCred.user;
          } else {
            throw signInError;
          }
        }
      } catch (emailAuthError) {
        console.error("Email/password authentication failed:", emailAuthError);
        throw emailAuthError;
      }
    }
  } catch (error) {
    console.error("All authentication methods failed:", error);
    throw new Error(`Failed to authenticate display: ${error.message}`);
  }
}

// Export all services and methods
export {
  app,
  db,
  rtdb,
  auth,
  storage,
  analytics,
  
  // Firestore exports
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  getDocs,
  
  // RTDB exports
  ref,
  set,
  get,
  push,
  onValue,
  serverTimestamp,
  
  // Auth exports
  googleProvider,
  facebookProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithCustomToken,
  
  // Storage exports
  storageRef,
  uploadBytes,
  getDownloadURL,
  
  // Analytics exports
  logEvent
  
  // IMPORTANT: Do not include any helper functions here that are exported individually
};

// Make the function available globally for direct access
if (typeof window !== 'undefined') {
  window.firebaseAuthenticateDisplay = authenticateDisplayService;
}

// Helper functions
export async function signInWithGoogle() {
  console.log("Starting Google sign-in process");
  try {
    // Create a new provider instance to ensure fresh state
    const provider = new GoogleAuthProvider();
    
    // Add scopes to request
    provider.addScope('profile');
    provider.addScope('email');
    
    // Set custom parameters to ensure proper authentication flow
    provider.setCustomParameters({
      // Force account selection even if user is already signed in
      prompt: 'select_account'
    });
    
    // Log important information for debugging
    console.log("Current hostname:", window.location.hostname);
    console.log("Auth domain being used:", auth.app.options.authDomain);
    console.log("Redirect URL:", window.location.href);
    
    try {
      // Try popup method first, as it's more user-friendly
      console.log("Attempting popup sign-in method");
      const result = await signInWithPopup(auth, provider);
      console.log("Popup sign-in successful:", result.user.email);
      return result.user;
    } catch (popupError) {
      console.warn("Popup sign-in failed, falling back to redirect method:", popupError.message);
      
      // Fall back to redirect method if popup fails
      // This is more reliable but requires a page reload
      console.log("Using redirect sign-in method as fallback");
      await signInWithRedirect(auth, provider);
      return null; // Page will redirect
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

// Continue with the rest of your file... 