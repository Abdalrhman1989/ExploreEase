import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import '../styles/Auth.css';
import axios from 'axios'; 

const Register = () => {
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState(''); 
  const [lastName, setLastName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('User'); 
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate password match
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Prepare user data to sync with backend
      const userData = {
        name,
        firstName,
        lastName,
        email,
        phoneNumber,
        userType: role,
      };

      // Sync user data with backend using environment variable
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/sync`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Navigate to home page upon successful registration
      navigate('/');
    } catch (error) {
      // Handle Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        alert('Email is already in use. Please try logging in.');
      } 
      // Handle backend errors
      else if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } 
      // Handle generic errors
      else {
        alert('An error occurred during registration.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        <form onSubmit={handleRegister} className="auth-form">
          
          <label htmlFor="username">User Name</label>
          <input 
            id="username"
            type="text" 
            placeholder="User Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="firstName">First Name</label>
          <input 
            id="firstName"
            type="text" 
            placeholder="First Name" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <label htmlFor="lastName">Last Name</label>
          <input 
            id="lastName"
            type="text" 
            placeholder="Last Name" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

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

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input 
            id="confirmPassword"
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label htmlFor="phoneNumber">Phone Number</label>
          <input 
            id="phoneNumber"
            type="text" 
            placeholder="Phone Number" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <label htmlFor="userType">User Type</label>
          <select 
            id="userType"
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            required
          >
            <option value="User">User</option>
            <option value="BusinessAdministrator">Business Administrator</option>
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
