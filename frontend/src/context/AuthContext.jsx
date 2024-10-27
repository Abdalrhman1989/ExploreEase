// src/context/AuthContext.jsx

import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut
import { auth } from '../firebase';
import axios from 'axios';

// Create the AuthContext
export const AuthContext = createContext();

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth); // Firebase signOut
      // The onAuthStateChanged listener will handle the rest (state reset, token removal)
    } catch (error) {
      console.error('Error during logout:', error);
      throw error; // Propagate the error to handle it in the UI
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);

        try {
          // Get the ID token from Firebase with force refresh
          const token = await currentUser.getIdToken(true);
          setIdToken(token);
          localStorage.setItem('authToken', token); // Store token in localStorage
          console.log("ID Token:", token);

          // Fetch user role from your backend
          const response = await axios.get('http://localhost:3001/api/protected/dashboard', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const userData = response.data.user;
          setUserRole(userData.UserType); 
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
        setIdToken(null);
        localStorage.removeItem('authToken'); // Clear token if user logs out
      }
      setLoading(false); // Set loading to false after auth state is determined
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, idToken, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Correct Export: Export AuthProvider, not AdminDashboard
export default AuthProvider;
