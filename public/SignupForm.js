// SignupForm.js

import React, { useState } from 'react';
import { signUpWithEmail } from './authService';

const SignupForm = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Form validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call signup function from authService
      await signUpWithEmail(formData.email, formData.password, formData.displayName);
      setVerificationSent(true);
      
      // Call success callback if provided
      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch (err) {
      // Handle specific Firebase error codes
      if (err.code === 'auth/email-already-in-use') {
        setError('Email address is already in use.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email address is not valid.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="verification-sent">
        <h2>Verification Email Sent</h2>
        <p>Please check your email to verify your account. You can close this window.</p>
      </div>
    );
  }

  return (
    <div className="signup-form">
      <h2>Create an Account</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
          />
        </div>
        
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
            minLength="6"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;