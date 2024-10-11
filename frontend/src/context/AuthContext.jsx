// src/context/AuthContext.jsx

import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

// Create the AuthContext
export const AuthContext = createContext();

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);

        try {
          // Get the ID token from Firebase
          const idToken = await currentUser.getIdToken();

          // Fetch user role from your backend
          const response = await axios.get('http://localhost:3001/api/protected/dashboard', {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          const userData = response.data.user;
          setUserRole(userData.UserType); // Adjust based on your backend response
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
      }
      setLoading(false); // Set loading to false after auth state is determined
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
