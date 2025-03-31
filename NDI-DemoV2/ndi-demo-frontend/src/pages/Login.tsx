import React from 'react';
import { QRCodeSVG } from "qrcode.react";
import { useLocation, useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: () => void;
  onRegister: () => void;
  isLoading: boolean;
  proofUrl: string | null;
  error: string | null;
  mode: 'login' | 'register' | null;
}

interface LocationState {
  message?: string;
  userData?: {
    Name: string;
    ID: string;
  };
  needsRegistration?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, isLoading, proofUrl, error, mode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const isRegistrationPage = location.pathname === '/register';

  const handleLoginClick = () => {
    onLogin();
  };

  const handleRegisterClick = () => {
    // Clear any existing state before registration
    navigate('/register', { state: {} });
    onRegister();
  };

  return (
    <div className="h-fit flex flex-col justify-center items-center bg-[#f2f2f4] p-8 rounded-2xl">
      <div className="bg-white rounded-3xl p-8 shadow-lg max-w-lg w-full">
        {!proofUrl ? (
          // Initial Buttons View
          <div className="text-center">
            <h3 className="text-xl text-black font-medium mb-8">
              {isRegistrationPage ? 'Register to NDI Demo' : 'Welcome to NDI Demo'}
            </h3>
            
            {state?.needsRegistration && (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-5 text-center">
                User not registered. You need to register first before logging in. <br/>
                <button
                  onClick={handleRegisterClick}
                  style={{
                    backgroundColor: '#124143',
                    color: 'white',
                    borderRadius: '5px',
                    padding: '1rem',
                    fontSize: '1rem',
                    width: "330px",
                    height: "50px",
                    marginTop: '1rem'
                  }}
                  className={`
                    w-full max-w-sm font-bold
                    transition-all duration-300 ease-in-out mx-auto
                    hover:opacity-90 cursor-pointer
                  `}
                >
                  Register with NDI
                </button>
              </div>
            )}

            {state?.message && (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-5 text-center">
                {state.message}
              </div>
            )}
            
            {state?.userData && (
              <div className="bg-gray-50 p-4 rounded-lg mb-5">
                <h4 className="mb-3 text-lg text-blue-600 font-semibold">User Details:</h4>
                <p className="mb-2"><span className="font-bold">Name:</span> {state.userData.Name}</p>
                <p className="mb-2"><span className="font-bold">ID:</span> {state.userData.ID}</p>
              </div>
            )}

            <div className="space-y-4">
              {!isRegistrationPage && !state?.userData && !state?.needsRegistration && (
                <button
                  onClick={handleLoginClick}
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#124143',
                    color: 'white',
                    borderRadius: '5px',
                    padding: '1rem',
                    fontSize: '1rem',
                    width: "330px",
                    height: "50px"
                  }}
                  className={`
                    w-full max-w-sm font-bold
                    transition-all duration-300 ease-in-out mx-auto
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}
                  `}
                >
                  {isLoading ? "Processing..." : "Login with NDI"}
                </button>
              )}

              {isRegistrationPage && (
                <button
                  onClick={handleRegisterClick}
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#124143',
                    color: 'white',
                    borderRadius: '5px',
                    padding: '1rem',
                    fontSize: '1rem',
                    width: "330px",
                    height: "50px"
                  }}
                  className={`
                    w-full max-w-sm font-bold
                    transition-all duration-300 ease-in-out mx-auto
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}
                  `}
                >
                  {isLoading ? "Processing..." : "Register with NDI"}
                </button>
              )}
            </div>
          </div>
        ) : (
          // QR Code Scanning Interface
          <div className="flex justify-center flex-col bg-gray-100" style={{
            padding: "2rem",
            backgroundColor: '#F8F8F8',
            borderRadius: '1rem',
            height: 'fit-content',
          }}>
            <h5 className="text-black text-lg font-medium" style={{marginTop: '-1rem'}}>
              {mode === 'login' ? 'Login with ' : 'Register with '}
              <span style={{color: '#5AC994'}}>Bhutan NDI</span> Wallet
            </h5>

            {/* QR Code Container Card */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="relative inline-block">
                <div className="p-4 bg-white rounded-xl">
                  <QRCodeSVG 
                    value={proofUrl} 
                    size={150}
                    level="H"
                    imageSettings={{
                      src: '/src/assets/QRNDIlogo.png',
                      width: 30,
                      height: 30,
                      x: undefined,
                      y: undefined,
                      excavate: true,
                    }}
                    style={{border: '2px solid #5AC994', borderRadius: '1rem', padding: '1rem'}}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="text-gray-600 space-y-4 text-sm" style={{color: '#A1A0A0', fontSize: '11px'}}>
                <p className="flex items-center">
                  <span className="bg-green-600 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs mr-2">1. </span>
                  Open Bhutan NDI Wallet on your phone
                </p>
                <p className="flex items-center">
                  <span className="bg-green-600 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs mr-2">2. </span>
                  Tap the Scan button located on the <br/> menu bar and scan the QR code
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 text-red-800 p-4 rounded-lg text-center text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;