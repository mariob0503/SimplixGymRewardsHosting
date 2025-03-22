const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Generates a custom token for display authentication
 * This function is protected by a simple security key mechanism
 */
exports.getDisplayToken = functions.https.onRequest(async (req, res) => {
  // Set CORS headers for all responses
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '3600');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  
  try {
    const { displayId, securityKey } = req.body;
    
    // Validate request parameters
    if (!displayId || !securityKey) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    // Simple security check - in production, use a more secure approach
    const expectedKey = 'simplix-display-' + displayId;
    if (securityKey !== expectedKey) {
      res.status(403).json({ error: 'Invalid security key' });
      return;
    }
    
    try {
      // Create a custom token with display-specific claims
      const customToken = await admin.auth().createCustomToken(displayId, {
        role: 'display',
        permissions: ['read_display', 'write_display']
      });
      
      // Log the token creation (but not the token itself)
      console.log(`Created custom token for display: ${displayId}`);
      
      // Return the token
      res.status(200).json({ token: customToken });
    } catch (authError) {
      console.error('Error creating custom token:', authError);
      res.status(500).json({ error: 'Error creating authentication token' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}); 