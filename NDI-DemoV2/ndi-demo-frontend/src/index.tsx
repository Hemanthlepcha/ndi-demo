import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import RegistrationSuccess from './pages/RegistrationSuccess';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
      </Routes>
    </Router>
  </React.StrictMode>
); 