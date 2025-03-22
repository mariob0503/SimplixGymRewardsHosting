/**
 * cleanup-displays.js
 * 
 * A standalone script to clean up orphaned display connections in the Firebase Realtime Database.
 * This can be run periodically from the browser console or integrated into your application.
 */

// Initialize the CleanupService object
const CleanupService = {
  // Set the stale threshold to 60 seconds (in milliseconds)
  staleThreshold: 60 * 1000,
  
  /**
   * Initialize Firebase if it's not already initialized
   */
  initFirebase: function() {
    // Check if Firebase is already initialized
    if (firebase.apps.length === 0) {
      // Firebase configuration - should match your existing config
      const firebaseConfig = {
        // Your Firebase config would be here 
        // This will use the already initialized Firebase instance from your page
      };
      
      // Initialize Firebase if needed
      firebase.initializeApp(firebaseConfig);
    }
    
    // Return the database reference
    return firebase.database();
  },
  
  /**
   * Clean up orphaned display connections
   * @returns {Promise} Promise that resolves with cleanup results
   */
  cleanupOrphanedDisplays: async function() {
    try {
      console.log("Starting orphaned display cleanup...");
      
      // Get database reference
      const db = this.initFirebase();
      const displaysRef = db.ref('displays');
      
      // Get all display entries
      const snapshot = await displaysRef.once('value');
      const displays = snapshot.val();
      
      if (!displays) {
        console.log('No display connections found');
        return { success: true, deletedCount: 0, totalCount: 0 };
      }
      
      // Current time
      const now = Date.now();
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
        if (timeSinceUpdate > this.staleThreshold) {
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
      return { 
        success: true, 
        deletedCount, 
        totalCount
      };
    } catch (error) {
      console.error('Error during display cleanup:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  },
  
  /**
   * Run cleanup with automatic scheduling
   * @param {number} intervalMinutes - How often to run the cleanup (in minutes)
   */
  scheduleCleanup: function(intervalMinutes = 5) {
    // Run cleanup immediately
    this.cleanupOrphanedDisplays();
    
    // Schedule recurring cleanup
    setInterval(() => {
      this.cleanupOrphanedDisplays();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`Scheduled automatic cleanup every ${intervalMinutes} minutes`);
  }
};

// Expose to global scope for manual execution from console
window.CleanupService = CleanupService; 