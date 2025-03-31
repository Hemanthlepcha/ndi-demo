import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LocationState {
  userName: string;
}

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome {state?.userName || 'User'}!</h1>
        <p>Your registration was successful.</p>
        <button
          onClick={() => navigate('/login')}
          style={{ 
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Continue to Login
        </button>
      </header>
    </div>
  );
};

export default Welcome; 