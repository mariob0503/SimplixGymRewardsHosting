const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Scheduled function that runs every 5 minutes to clean up stale display entries in Firestore
 * Removes any display entries that haven't been seen in the last 60 seconds
 */
exports.cleanupFirestoreDisplays = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const db = admin.firestore();
  const displaysRef = db.collection('displays');
  
  try {
    // Calculate the stale threshold timestamp (60 seconds ago)
    const staleThreshold = new Date(Date.now() - (60 * 1000)).toISOString();
    
    // Query for stale display entries
    const staleDisplays = await displaysRef
      .where('lastSeen', '<', staleThreshold)
      .get();
    
    if (staleDisplays.empty) {
      console.log('No stale display entries found in Firestore');
      return null;
    }
    
    // Delete stale entries
    const batch = db.batch();
    let deleteCount = 0;
    
    staleDisplays.forEach(doc => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    
    // Commit the batch delete
    await batch.commit();
    
    console.log(`Cleanup complete: Removed ${deleteCount} stale display entries from Firestore`);
    return null;
  } catch (error) {
    console.error('Error during Firestore display cleanup:', error);
    return null;
  }
}); 