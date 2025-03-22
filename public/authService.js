// authService.js - Authentication service

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from './firebase';

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user profile in Firestore
    await createUserProfile(user, { displayName });
    
    return user;
  } catch (error) {
    console.error("Error signing up with email:", error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login timestamp
    const userRef = doc(firestore, 'users', userCredential.user.uid);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
    
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if user profile exists, if not create it
    const userRef = doc(firestore, 'users', userCredential.user.uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      // Create user profile
      await createUserProfile(userCredential.user);
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    }
    
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Create user profile in Firestore
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(firestore, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();

    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: displayName || additionalData.displayName || '',
        email,
        photoURL: photoURL || '',
        emailVerified: user.emailVerified,
        createdAt,
        lastLogin: createdAt,
        points: 0, // Game points
        loyaltyPoints: 0, // Shopify loyalty points
        userType: additionalData.userType || 'regular',
        gym: additionalData.gym || null,
        tribe: additionalData.tribe || null,
        preferences: additionalData.preferences || {
          theme: 'system',
          notifications: true
        },
        ...additionalData
      });
      
      return userRef;
    } catch (error) {
      console.error('Error creating user profile', error);
      throw error;
    }
  }
  
  return userRef;
};

// Get current user profile from Firestore
export const getCurrentUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = doc(firestore, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user found');

  const userRef = doc(firestore, 'users', user.uid);
  
  try {
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return userRef;
  } catch (error) {
    console.error('Error updating user profile', error);
    throw error;
  }
};

// Set up auth state observer
export const initAuthListener = (onUserLoggedIn, onUserLoggedOut) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userProfile = await getCurrentUserProfile();
      onUserLoggedIn(userProfile || user);
    } else {
      onUserLoggedOut();
    }
  });
};

// Export auth instance for direct access if needed
export { auth };