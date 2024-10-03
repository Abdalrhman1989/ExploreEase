// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import '../styles/Auth.css';
import axios from 'axios'; // Install axios: npm install axios

const Register = () => {
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState(''); // Added for MySQL
  const [lastName, setLastName] = useState(''); // Added for MySQL
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role is 'user'
  const [phoneNumber, setPhoneNumber] = useState(''); // Optional
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Registered with Firebase:', user.uid);

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Send user data to backend to store in MySQL
      await axios.post('http://localhost:3001/api/auth/sync', {
        name,
        firstName,
        lastName,
        email,
        phoneNumber,
        userType: role,
        profilePicture: '' // Add if available
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      console.log('Registered and synchronized with MySQL successfully');

      // Redirect to the appropriate page based on role
      if (role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (role === 'BusinessAdministrator') {
        navigate('/business/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error registering', error);
      // Handle registration errors
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
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
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        <form onSubmit={handleRegister} className="auth-form">
          <input 
            type="text" 
            placeholder="User Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="First Name" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="Last Name" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
          <input 
            type="text" 
            placeholder="Phone Number" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
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
