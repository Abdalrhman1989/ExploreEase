import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth); 
    } catch (error) {
      console.error('Error during logout:', error);
      throw error; 
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);

        try {
          const token = await currentUser.getIdToken(true);
          setIdToken(token);
          localStorage.setItem('authToken', token); 
          console.log("ID Token:", token);

          // Fetch user role
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/protected/dashboard`, {
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
        localStorage.removeItem('authToken'); 
      }
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, idToken, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;