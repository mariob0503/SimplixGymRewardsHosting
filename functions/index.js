const displayAuth = require('./display-auth');
const cleanupOrphanedDisplays = require('./cleanup-orphaned-displays');
const cleanupFirestoreDisplays = require('./cleanup-firestore-displays');

// Export all functions
exports.getDisplayToken = displayAuth.getDisplayToken;
exports.cleanupOrphanedDisplays = cleanupOrphanedDisplays.cleanupOrphanedDisplays;
exports.cleanupFirestoreDisplays = cleanupFirestoreDisplays.cleanupFirestoreDisplays; 