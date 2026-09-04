import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { AuthProvider } from "./contexts/AuthContext";
import { StompProvider } from "./contexts/StompContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <AuthProvider>
      <StompProvider>
        <App />
      </StompProvider>
    </AuthProvider>
  // </React.StrictMode>
);
