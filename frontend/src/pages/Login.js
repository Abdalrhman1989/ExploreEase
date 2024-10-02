import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import '../styles/Auth.css';

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retrieve the user's role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const role = userData?.role || 'user';

      console.log('Logged in successfully');

      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'business') {
        navigate('/business/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error logging in Firebase:', error.message);
      console.error('Error code:', error.code);

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
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        // New user, set up profile in Firestore with a default role
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          role: 'user', // Default role is 'user'
          createdAt: new Date()
        });
      }

      // Redirect based on role
      const userData = userDoc.exists() ? userDoc.data() : { role: 'user' };
      const role = userData.role;

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'business') {
        navigate('/business/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      alert('Failed to log in with Google. Please try again.');
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
