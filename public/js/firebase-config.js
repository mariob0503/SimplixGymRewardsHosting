// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClBe85KzYpdCBmidhGlJlw-1eUZG9aBg8",
  // Dynamically set authDomain based on current hostname
  authDomain: window.location.hostname.includes('web.app') 
    ? "simplixgymrewards.web.app" 
    : "simplixgymrewards.firebaseapp.com",
  databaseURL: "https://simplixgymrewards-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "simplixgymrewards",
  storageBucket: "simplixgymrewards.firebasestorage.app",
  messagingSenderId: "821049711023",
  appId: "1:821049711023:web:32fb1e80755cc00531f75a",
  measurementId: "G-TP948S3PD8"
};

// Log the current configuration for debugging
console.log("Firebase config using authDomain:", firebaseConfig.authDomain);
console.log("Current hostname:", window.location.hostname);

// For Firebase v8.x (legacy support)
if (typeof firebase !== 'undefined') {
  // Check if Firebase is already initialized
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}

// For Firebase v9+ (modern module approach)
export default firebaseConfig;
