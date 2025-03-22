// AuthContainer.js

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import UserProfile from './UserProfile';
import { logOut } from './authService';

const AuthContainer = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [view, setView] = useState('login'); // 'login' or 'signup'
  
  const handleSignOut = async () => {
    try {
      await logOut();
      // Redirect or handle UI changes after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (isAuthenticated) {
    return (
      <div className="auth-container authenticated">
        <div className="welcome-message">
          <h2>Welcome, {currentUser.displayName || 'User'}!</h2>
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>
        </div>
        
        <UserProfile />
      </div>
    );
  }
  
  return (
    <div className="auth-container">
      {view === 'login' ? (
        <>
          <LoginForm onLoginSuccess={() => {}} />
          <div className="auth-switch">
            <p>Don't have an account?</p>
            <button onClick={() => setView('signup')}>
              Sign Up
            </button>
          </div>
        </>
      ) : (
        <>
          <SignupForm onSignupSuccess={() => setView('login')} />
          <div className="auth-switch">
            <p>Already have an account?</p>
            <button onClick={() => setView('login')}>
              Sign In
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthContainer;