// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase"; 
import '../styles/Auth.css';
import axios from 'axios'; // Install axios: npm install axios

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please provide both email and password');
      return;
    }

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Logged in with Firebase:', user.uid);

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Fetch user data from backend (MySQL)
      const response = await axios.get('http://localhost:3001/api/protected/dashboard', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      const userData = response.data.user;
      const role = userData.UserType || 'User';

      console.log('User data from MySQL:', userData);

      // Redirect based on role
      if (role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (role === 'BusinessAdministrator') {
        navigate('/business/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error logging in Firebase:', error);
      // Handle login errors
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        switch (error.code) {
          case 'auth/user-not-found':
            alert('No user found with this email.');
            break;
          case 'auth/wrong-password':
            alert('Incorrect password.');
            break;
          case 'auth/invalid-email':
            alert('Invalid email format.');
            break;
          default:
            alert('Failed to log in. Please try again.');
        }
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('Logged in with Google:', user.uid);

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Check if user exists in MySQL
      const response = await axios.get('http://localhost:3001/api/protected/dashboard', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.status === 404) {
        // User doesn't exist in MySQL, synchronize
        await axios.post('http://localhost:3001/api/auth/sync', {
          name: user.displayName || '',
          firstName: '', // Populate if available
          lastName: '',  // Populate if available
          email: user.email,
          phoneNumber: '', // Populate if available
          userType: 'User',
          profilePicture: user.photoURL || ''
        }, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        console.log('User synchronized with MySQL');
      }

      // Fetch updated user data
      const updatedResponse = await axios.get('http://localhost:3001/api/protected/dashboard', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      const userData = updatedResponse.data.user;
      const role = userData.UserType || 'User';

      // Redirect based on role
      if (role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (role === 'BusinessAdministrator') {
        navigate('/business/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      // Handle Google login errors
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to log in with Google. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">Login</button>
        </form>
        <p className="auth-switch">
          Don't have an account? <a href="/register">Register here</a>
        </p>
        <button onClick={handleGoogleLogin} className="google-login-button">
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
