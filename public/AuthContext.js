// AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { initAuthListener } from './authService';

// Create the context
const AuthContext = createContext();

// Context provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Set up the auth state listener
    const unsubscribe = initAuthListener(
      // User logged in
      (user) => {
        setCurrentUser(user);
        setLoading(false);
      },
      // User logged out
      () => {
        setCurrentUser(null);
        setLoading(false);
      }
    );
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);
  
  // Context value
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};