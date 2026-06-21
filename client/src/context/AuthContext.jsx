/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://codealpha-socialmediaplatform-xakt.onrender.com/api';
export const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE || 'https://codealpha-socialmediaplatform-xakt.onrender.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync authorization requests helper
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token is invalid/expired
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login
  const login = async (emailOrUsername, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        profilePic: data.profilePic,
        coverPic: data.coverPic,
        bio: data.bio,
        followers: data.followers,
        following: data.following
      });
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  // Register
  const register = async (username, email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        profilePic: data.profilePic,
        coverPic: data.coverPic,
        bio: data.bio,
        followers: data.followers,
        following: data.following
      });
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  // Update profile
  const updateProfile = async (bio, profilePicFile, coverPicFile) => {
    try {
      const formData = new FormData();
      if (bio !== undefined) formData.append('bio', bio);
      if (profilePicFile) formData.append('profilePic', profilePicFile);
      if (coverPicFile) formData.append('coverPic', coverPicFile);

      const res = await fetch(`${API_BASE}/users/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const updatedUser = await res.json();

      if (!res.ok) {
        throw new Error(updatedUser.message || 'Failed to update profile');
      }

      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  };

  // Follow / Unfollow User Helper
  const followUser = async (targetUserId) => {
    try {
      const res = await fetch(`${API_BASE}/users/${targetUserId}/follow`, {
        method: 'PUT',
        headers: getHeaders()
      });

      const data = await res.json();

      if (res.ok) {
        // Update local user follows list
        setUser(prevUser => ({
          ...prevUser,
          following: data.following
        }));
        return data;
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        login,
        register,
        logout,
        updateProfile,
        followUser,
        getHeaders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
