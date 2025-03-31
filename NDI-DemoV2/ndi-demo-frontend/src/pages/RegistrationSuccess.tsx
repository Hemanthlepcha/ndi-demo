import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  message: string;
  userData: {
    Name: string;
    ID: string;
  };
}

const RegistrationSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div className="card" style={{ 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: '#fff'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Registration Successful!</h2>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#d4edda', 
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#155724'
        }}>
          {state?.message || 'Your registration has been completed successfully!'}
        </div>
        {state?.userData && (
          <div style={{ 
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Your Information:</h3>
            <p><strong>Name:</strong> {state.userData.Name}</p>
            <p><strong>ID:</strong> {state.userData.ID}</p>
          </div>
        )}
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default RegistrationSuccess; 