import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'; 
import { doc, setDoc } from "firebase/firestore"; 
import '../styles/Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role is 'user'
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save the user's profile information in Firestore with the role
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: role, // Save the role
        createdAt: new Date()
      });
      console.log('Registered and profile saved successfully');
      
      // Redirect to the appropriate page based on role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'business') {
        navigate('/business/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error registering', error);
      // Handle registration errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          alert('Email is already in use. Please try logging in.');
          break;
        case 'auth/invalid-email':
          alert('Invalid email format.');
          break;
        case 'auth/weak-password':
          alert('Password is too weak. Please choose a stronger password.');
          break;
        default:
          alert('Failed to register. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        <form onSubmit={handleRegister} className="auth-form">
          <input 
            type="text" 
            placeholder="Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="business">Business</option>
          </select>
          <button type="submit" className="auth-button">Register</button>
        </form>
        <p className="auth-switch">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;