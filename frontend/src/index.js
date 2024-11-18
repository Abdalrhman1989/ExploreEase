import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext'; 
import './styles/App.css';
import * as serviceWorker from '../src/serviceWorker'; // Import the service worker registration

// Dynamically add the manifest.json file to the app
const link = document.createElement('link');
link.rel = 'manifest';
link.href = './manifest.json'; 
document.head.appendChild(link);

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

// Register the service worker for offline capabilities and PWA functionality
serviceWorker.register();
