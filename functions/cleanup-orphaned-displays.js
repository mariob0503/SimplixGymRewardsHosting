const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Scheduled function that runs every 5 minutes to clean up orphaned display connections
 * Looks for any display connections that haven't been updated in the last 60 seconds and removes them
 */
exports.cleanupOrphanedDisplays = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const db = admin.database();
  const displaysRef = db.ref('displays');
  
  try {
    // Get all display entries
    const snapshot = await displaysRef.once('value');
    const displays = snapshot.val();
    
    if (!displays) {
      console.log('No display connections found');
      return null;
    }
    
    // Current time
    const now = Date.now();
    const staleThreshold = 60 * 1000; // 60 seconds in milliseconds
    let deletedCount = 0;
    let totalCount = 0;
    
    // Check each display for staleness
    const deletePromises = [];
    
    for (const [displayId, displayData] of Object.entries(displays)) {
      totalCount++;
      
      // Skip entries without a lastUpdated timestamp
      if (!displayData || !displayData.lastUpdated) {
        console.log(`Display ${displayId} has no lastUpdated timestamp, removing it`);
        deletePromises.push(displaysRef.child(displayId).remove());
        deletedCount++;
        continue;
      }
      
      // Check if the display connection is stale
      const timeSinceUpdate = now - displayData.lastUpdated;
      if (timeSinceUpdate > staleThreshold) {
        console.log(`Display ${displayId} is stale (last updated ${timeSinceUpdate/1000} seconds ago), removing it`);
        deletePromises.push(displaysRef.child(displayId).remove());
        deletedCount++;
      }
    }
    
    // Execute all delete operations
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
    
    console.log(`Cleanup complete: ${deletedCount} orphaned displays removed out of ${totalCount} total displays`);
    return null;
  } catch (error) {
    console.error('Error during display cleanup:', error);
    return null;
  }
}); 