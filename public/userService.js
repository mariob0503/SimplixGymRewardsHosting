// userService.js - User database operations

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from './firebase';

// Valid user types (predefined values)
export const USER_TYPES = ['regular', 'premium', 'admin'];

// Valid themes (predefined values)
export const THEMES = ['light', 'dark', 'system'];

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Update points for a user
export const updateUserPoints = async (userId, pointsToAdd) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    
    await updateDoc(userRef, {
      points: increment(pointsToAdd),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

// Update loyalty points for a user (for Shopify integration)
export const updateLoyaltyPoints = async (userId, pointsToAdd) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    
    await updateDoc(userRef, {
      loyaltyPoints: increment(pointsToAdd),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating loyalty points:', error);
    throw error;
  }
};

// Set user gym affiliation
export const setUserGym = async (userId, gymId) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    
    await updateDoc(userRef, {
      gym: gymId,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error setting user gym:', error);
    throw error;
  }
};

// Set user tribe
export const setUserTribe = async (userId, tribeId) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    
    await updateDoc(userRef, {
      tribe: tribeId,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error setting user tribe:', error);
    throw error;
  }
};

// Get top users by points (leaderboard)
export const getLeaderboard = async (limit = 10) => {
  try {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, orderBy('points', 'desc'), limit(limit));
    const querySnapshot = await getDocs(q);
    
    const leaderboard = [];
    querySnapshot.forEach(doc => {
      leaderboard.push({
        id: doc.id,
        displayName: doc.data().displayName,
        points: doc.data().points,
        photoURL: doc.data().photoURL
      });
    });
    
    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

// Get leaderboard by gym
export const getGymLeaderboard = async (gymId, limitCount = 10) => {
  try {
    const usersRef = collection(firestore, 'users');
    const q = query(
      usersRef, 
      where('gym', '==', gymId),
      orderBy('points', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    const leaderboard = [];
    querySnapshot.forEach(doc => {
      leaderboard.push({
        id: doc.id,
        displayName: doc.data().displayName,
        points: doc.data().points,
        photoURL: doc.data().photoURL
      });
    });
    
    return leaderboard;
  } catch (error) {
    console.error('Error getting gym leaderboard:', error);
    throw error;
  }
};

// Get leaderboard by tribe
export const getTribeLeaderboard = async (tribeId, limitCount = 10) => {
  try {
    const usersRef = collection(firestore, 'users');
    const q = query(
      usersRef, 
      where('tribe', '==', tribeId),
      orderBy('points', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    const leaderboard = [];
    querySnapshot.forEach(doc => {
      leaderboard.push({
        id: doc.id,
        displayName: doc.data().displayName,
        points: doc.data().points,
        photoURL: doc.data().photoURL
      });
    });
    
    return leaderboard;
  } catch (error) {
    console.error('Error getting tribe leaderboard:', error);
    throw error;
  }
};

// Export constants for use elsewhere
export { USER_TYPES, THEMES };