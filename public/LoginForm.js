// LoginForm.js

import React, { useState } from 'react';
import { signInWithEmail, signInWithGoogle, resetPassword } from './authService';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await signInWithEmail(formData.email, formData.password);
      
      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      // Handle specific Firebase error codes
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email address.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with that email.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Sign In</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {!resetSent ? (
        <>
          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In with Email'}
            </button>
          </form>
          
          <div className="separator">OR</div>
          
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="google-button"
          >
            Sign In with Google
          </button>
          
          <div className="forgot-password">
            <p>Forgot Password?</p>
            <div className="reset-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <button onClick={handleResetPassword} disabled={loading}>
                Reset Password
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="reset-sent">
          <h3>Password Reset Email Sent</h3>
          <p>Check your email for instructions to reset your password.</p>
          <button onClick={() => setResetSent(false)}>Back to Login</button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;