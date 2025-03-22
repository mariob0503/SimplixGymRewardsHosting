// LoginForm.js

import React, { useState } from 'react';
import { signInWithGoogle } from './authService';

const LoginForm = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      const user = await signInWithGoogle();
      
      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Sign In</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        onClick={handleGoogleLogin} 
        disabled={loading}
        className="google-button"
      >
        {loading ? 'Signing In...' : 'Sign In with Google'}
      </button>
    </div>
  );
};

export default LoginForm;