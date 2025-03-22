// UserProfile.js

import React, { useState, useEffect } from 'react';
import { getCurrentUserProfile, updateUserProfile } from './authService';
import { USER_TYPES, THEMES } from './userService';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await getCurrentUserProfile();
        setProfile(userProfile);
      } catch (err) {
        setError('Failed to load profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects like preferences
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear messages
    setError('');
    setSuccess('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Only update fields that should be editable by the user
      const { displayName, userType, gym, tribe, preferences } = profile;
      await updateUserProfile({ displayName, userType, gym, tribe, preferences });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }
  
  if (!profile) {
    return <div className="not-found">Profile not found. Please sign in.</div>;
  }
  
  return (
    <div className="user-profile">
      <h2>Your Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={profile.displayName || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-info">
          <div className="info-item">
            <strong>Email:</strong> {profile.email}
            {profile.emailVerified ? 
              <span className="verified-badge">Verified</span> : 
              <span className="not-verified-badge">Not Verified</span>
            }
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="userType">User Type</label>
          <select
            id="userType"
            name="userType"
            value={profile.userType || 'regular'}
            onChange={handleChange}
          >
            {USER_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="gym">Gym</label>
          <input
            type="text"
            id="gym"
            name="gym"
            value={profile.gym || ''}
            onChange={handleChange}
            placeholder="Your gym ID"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tribe">Tribe</label>
          <input
            type="text"
            id="tribe"
            name="tribe"
            value={profile.tribe || ''}
            onChange={handleChange}
            placeholder="Your tribe ID"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="preferences.theme">Theme Preference</label>
          <select
            id="preferences.theme"
            name="preferences.theme"
            value={(profile.preferences && profile.preferences.theme) || 'system'}
            onChange={handleChange}
          >
            {THEMES.map(theme => (
              <option key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="points-display">
          <div className="points-item">
            <span className="points-label">Game Points:</span>
            <span className="points-value">{profile.points || 0}</span>
          </div>
          <div className="points-item">
            <span className="points-label">Loyalty Points:</span>
            <span className="points-value">{profile.loyaltyPoints || 0}</span>
          </div>
        </div>
        
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;