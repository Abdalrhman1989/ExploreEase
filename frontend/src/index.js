// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import './styles/App.css'; // Ensure your global styles are imported

// Ensure your public/index.html includes the Font Awesome link within the <head> tag.

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
