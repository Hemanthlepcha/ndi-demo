import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";

interface ProofResponse {
  proofRequestURL: string;
  threadId: string;
}

interface ProofResult {
  status: string;
  verification_result: string;
  userData: {
    Name: string;
    ID: string;
  };
  isExistingUser: boolean;
  message: string;
}

function AppContent() {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | null>(null);
  const navigate = useNavigate();

  // Reset states
  const resetStates = useCallback(() => {
    setProofUrl(null);
    setProofResult(null);
    setThreadId(null);
    setError(null);
    setIsLoading(false);
    setMode(null);
  }, []);

  useEffect(() => {
    if (proofResult) {
      if (mode === 'login') {
        // Handle login flow
        if (proofResult.isExistingUser) {
          navigate('/login', { 
            state: { 
              message: "Welcome back!",
              userData: proofResult.userData 
            }
          });
        } else {
          // User needs to register first
          navigate('/', { 
            state: { 
              needsRegistration: true 
            }
          });
        }
      } else if (mode === 'register') {
        // Handle registration flow
        if (proofResult.isExistingUser) {
          // User already exists, redirect to login
          navigate('/login', {
            state: {
              message: "You're already registered! Please login.",
              userData: proofResult.userData
            }
          });
        } else {
          // Registration successful
          navigate('/login', {
            state: {
              message: "Registration successful! Please login to continue.",
            }
          });
        }
      }
      // Reset states after handling the result
      resetStates();
    }
  }, [proofResult, navigate, resetStates, mode]);

  const handleLogin = async () => {
    try {
      resetStates(); // Reset all states before starting new login
      setIsLoading(true);
      setMode('login');
      
      const response = await axios.post<{ data: ProofResponse }>(
        "http://localhost:5000/api/proof-request"
      );
      
      const { proofRequestURL, threadId } = response.data.data;
      setProofUrl(proofRequestURL);
      setThreadId(threadId);

      let pollCount = 0;
      const maxPolls = 60;

      const interval = setInterval(async () => {
        if (pollCount >= maxPolls) {
          clearInterval(interval);
          setError("Verification timeout. Please try again.");
          resetStates();
          return;
        }

        try {
          const result = await axios.get(
            `http://localhost:5000/api/proof-results/${threadId}`
          );

          if (result.data.status === "success") {
            clearInterval(interval);
            setProofResult(result.data);
            return;
          }

          if (result.status === 202) {
            console.log("Proof verification in progress...");
            pollCount++;
            return;
          }

        } catch (error: any) {
          if (error.response?.status === 404) {
            console.log("Waiting for proof result...");
            pollCount++;
          } else {
            clearInterval(interval);
            setError("Error checking proof result: " + error.message);
            resetStates();
          }
        }
      }, 5000);

      return () => clearInterval(interval);

    } catch (error: any) {
      setError("Error initiating login: " + error.message);
      resetStates();
    }
  };

  const handleRegister = async () => {
    try {
      resetStates(); // Reset all states before starting new registration
      setIsLoading(true);
      setMode('register');
      
      const response = await axios.post<{ data: ProofResponse }>(
        "http://localhost:5000/api/proof-request"
      );
      
      const { proofRequestURL, threadId } = response.data.data;
      setProofUrl(proofRequestURL);
      setThreadId(threadId);

      let pollCount = 0;
      const maxPolls = 60;

      const interval = setInterval(async () => {
        if (pollCount >= maxPolls) {
          clearInterval(interval);
          setError("Verification timeout. Please try again.");
          resetStates();
          return;
        }

        try {
          const result = await axios.get(
            `http://localhost:5000/api/proof-results/${threadId}`
          );

          if (result.data.status === "success") {
            clearInterval(interval);
            setProofResult(result.data);
            return;
          }

          if (result.status === 202) {
            console.log("Proof verification in progress...");
            pollCount++;
            return;
          }

        } catch (error: any) {
          if (error.response?.status === 404) {
            console.log("Waiting for proof result...");
            pollCount++;
          } else {
            clearInterval(interval);
            setError("Error checking proof result: " + error.message);
            resetStates();
          }
        }
      }, 5000);

      return () => clearInterval(interval);

    } catch (error: any) {
      setError("Error initiating registration: " + error.message);
      resetStates();
    }
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Login 
            onLogin={handleLogin}
            onRegister={handleRegister}
            isLoading={isLoading}
            proofUrl={proofUrl}
            error={error}
            mode={mode}
          />
        } 
      />
      <Route 
        path="/login" 
        element={
          <Login 
            onLogin={handleLogin}
            onRegister={handleRegister}
            isLoading={isLoading}
            proofUrl={proofUrl}
            error={error}
            mode={mode}
          />
        } 
      />
      <Route 
        path="/register" 
        element={
          <Login 
            onLogin={handleLogin}
            onRegister={handleRegister}
            isLoading={isLoading}
            proofUrl={proofUrl}
            error={error}
            mode={mode}
          />
        } 
      />
      <Route 
        path="/welcome" 
        element={<Welcome />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
