// Auth debugging helper
export function diagnoseAuthIssues() {
  console.log("=== Auth Diagnostics ===");
  
  // Check current URL
  console.log("Current URL:", window.location.href);
  
  // Check for common issues
  const issues = [];
  
  // Check if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    issues.push("Running on localhost - ensure localhost is added to authorized domains in Firebase console");
  }
  
  // Check if using HTTP instead of HTTPS
  if (window.location.protocol !== 'https:' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    issues.push("Not using HTTPS - Google Auth requires HTTPS except on localhost");
  }
  
  // Check for third-party cookie issues
  const cookieEnabled = navigator.cookieEnabled;
  if (!cookieEnabled) {
    issues.push("Cookies are disabled in the browser");
  }
  
  // Check if in an iframe
  if (window !== window.top) {
    issues.push("Page is running in an iframe, which can cause authentication issues");
  }
  
  // Check browser compatibility
  const userAgent = navigator.userAgent;
  console.log("Browser:", userAgent);
  
  // Report findings
  if (issues.length > 0) {
    console.warn("Potential authentication issues found:");
    issues.forEach(issue => console.warn(`- ${issue}`));
  } else {
    console.log("No common authentication issues detected");
  }
  
  console.log("=== End Diagnostics ===");
  
  return {
    issues,
    userAgent,
    url: window.location.href,
    cookiesEnabled: cookieEnabled
  };
}

// Enhanced Google Auth debugging
export function debugGoogleAuth(options = {}) {
  // Default options
  const settings = {
    showUI: false,     // By default, don't show any UI
    silent: false      // By default, log to console
  };
  
  // Override defaults with provided options
  Object.assign(settings, options);
  
  console.log("=== Google Auth Debugging Started ===");
  
  // Create a debugging div on the page only if showUI is true
  let debugDiv = document.getElementById('google-auth-debug');
  
  // If showUI is false, remove any existing debug UI
  if (!settings.showUI && debugDiv) {
    debugDiv.remove();
    debugDiv = null;
  }
  
  // Only create the debug UI if showUI is true
  if (settings.showUI && !debugDiv) {
    debugDiv = document.createElement('div');
    debugDiv.id = 'google-auth-debug';
    debugDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      max-height: 400px;
      overflow-y: auto;
      background-color: rgba(0,0,0,0.8);
      color: #00FF00;
      padding: 15px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      border: 1px solid #00FF00;
    `;
    document.body.appendChild(debugDiv);
  }
  
  function log(message, type = 'info') {
    const colors = {
      info: '#00FF00',
      warning: '#FFFF00',
      error: '#FF0000'
    };
    
    // Always log to console unless silent is true
    if (!settings.silent) {
      console.log(`[GoogleAuth Debug] ${message}`);
    }
    
    // Only add to the UI if it exists
    if (debugDiv) {
      const entry = document.createElement('div');
      entry.style.marginBottom = '5px';
      entry.style.color = colors[type] || colors.info;
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      debugDiv.appendChild(entry);
      debugDiv.scrollTop = debugDiv.scrollHeight;
    }
  }
  
  // Initial diagnostics
  log('Starting Google Auth debug');
  log(`URL: ${window.location.href}`);
  log(`User Agent: ${navigator.userAgent}`);
  
  try {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
      log('Firebase global is not defined!', 'error');
    } else {
      log('Firebase global is available');
      
      // Check auth initialization
      if (firebase.auth) {
        log('Firebase Auth is initialized');
        
        // Check current user
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
          log(`User is already logged in as: ${currentUser.email}`, 'info');
        } else {
          log('No user is currently logged in');
        }
      } else {
        log('Firebase Auth is not initialized!', 'error');
      }
    }
    
    // Try to import Firebase modules
    import('/js/firebase-services.js')
      .then(module => {
        log('Firebase services module loaded successfully');
        
        if (module.auth) {
          log('Auth service is available from module');
          
          // Check current user from module
          const currentUser = module.auth.currentUser;
          if (currentUser) {
            log(`Module auth shows logged in user: ${currentUser.email}`, 'info');
          } else {
            log('Module auth shows no logged in user');
          }
          
          // Try to check pending redirects
          if (module.checkRedirectResult) {
            log('Checking for redirect results...');
            module.checkRedirectResult()
              .then(user => {
                if (user) {
                  log(`Redirect result success! User: ${user.email}`, 'info');
                } else {
                  log('No redirect result found');
                }
              })
              .catch(error => {
                log(`Redirect result error: ${error.message}`, 'error');
              });
          } else {
            log('checkRedirectResult function not available', 'warning');
          }
        } else {
          log('Auth service is NOT available from module', 'error');
        }
      })
      .catch(error => {
        log(`Error importing firebase-services.js: ${error.message}`, 'error');
      });
      
    // Check session storage for auth errors
    const storedError = sessionStorage.getItem('authError');
    if (storedError) {
      try {
        const errorData = JSON.parse(storedError);
        log(`Found stored auth error: ${errorData.message}`, 'error');
      } catch (e) {
        log(`Found invalid stored auth error: ${storedError}`, 'error');
      }
    } else {
      log('No stored auth errors found');
    }
    
    // Add a button to manually test Google sign-in ONLY if showUI is true
    if (settings.showUI && debugDiv) {
      const testButton = document.createElement('button');
      testButton.textContent = 'Test Google Sign-In';
      testButton.style.cssText = `
        background: #4285F4;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        margin-top: 10px;
        cursor: pointer;
      `;
      testButton.onclick = () => {
        log('Manual Google sign-in test initiated');
        import('/js/firebase-services.js')
          .then(module => {
            if (module.signInWithGoogle) {
              log('Calling signInWithGoogle...');
              module.signInWithGoogle()
                .then(user => {
                  if (user) {
                    log(`Sign-in successful! User: ${user.email}`, 'info');
                  } else {
                    log('Redirect initiated, page will reload');
                  }
                })
                .catch(error => {
                  log(`Sign-in error: ${error.message}`, 'error');
                });
            } else {
              log('signInWithGoogle function not available', 'error');
            }
          })
          .catch(error => {
            log(`Module import error: ${error.message}`, 'error');
          });
      };
      debugDiv.appendChild(testButton);
    }
    
  } catch (error) {
    log(`Unexpected error: ${error.message}`, 'error');
  }
  
  // Return methods for interacting with the debugger
  return {
    log,
    showUI: () => {
      // Create UI if it doesn't exist
      if (!debugDiv) {
        // Recall this function with showUI set to true
        return debugGoogleAuth({ ...settings, showUI: true });
      }
      return true;
    },
    hideUI: () => {
      if (debugDiv) {
        debugDiv.remove();
        debugDiv = null;
      }
      return true;
    }
  };
}

// You can call this function from the browser console: 
// import('/js/auth-debug.js').then(module => module.diagnoseAuthIssues()) 
// Or for Google auth debugging:
// import('/js/auth-debug.js').then(module => module.debugGoogleAuth()) 