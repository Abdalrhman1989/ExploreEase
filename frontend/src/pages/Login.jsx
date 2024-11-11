import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase"; 
import '../styles/Auth.css';
import axios from 'axios'; 
import { ReactComponent as GoogleLogo } from '../assets/google-icon-logo.svg'; 

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

      // Fetch user data from backend
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/protected/dashboard`, {
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

      try {
        // Attempt to fetch user data from backend
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/protected/dashboard`, {
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
        if (error.response && error.response.status === 404) {
          try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/sync`, {
              name: user.displayName || '',
              firstName: '', 
              lastName: '',  
              email: user.email,
              phoneNumber: '', 
              userType: 'User',
              profilePicture: user.photoURL || ''
            }, {
              headers: {
                'Authorization': `Bearer ${idToken}`
              }
            });
            console.log('User synchronized with MySQL');

            // Fetch updated user data after synchronization
            const updatedResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/protected/dashboard`, {
              headers: {
                'Authorization': `Bearer ${idToken}`
              }
            });

            const updatedUserData = updatedResponse.data.user;
            const role = updatedUserData.UserType || 'User';

            // Redirect based on role
            if (role === 'Admin') {
              navigate('/admin/dashboard');
            } else if (role === 'BusinessAdministrator') {
              navigate('/business/dashboard');
            } else {
              navigate('/');
            }
          } catch (syncError) {
            console.error('Error synchronizing user:', syncError);
            if (syncError.response && syncError.response.data && syncError.response.data.message) {
              alert(syncError.response.data.message);
            } else {
              alert('Failed to synchronize user. Please try again.');
            }
          }
        } else {
          // Handle other errors from axios.get
          console.error('Error fetching user data:', error);
          if (error.response && error.response.data && error.response.data.message) {
            alert(error.response.data.message);
          } else {
            alert('Failed to fetch user data. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error during Google login:', error);
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
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <label htmlFor="password">Password</label>
          <input
            id="password"
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
          <GoogleLogo className="google-logo" />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
