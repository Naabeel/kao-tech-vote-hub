
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This page will be hit by Zoho OAuth redirect
    // The ZohoAuth component will handle the callback logic
    // and then redirect to the main page
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Processing authentication...</h2>
        <p className="text-gray-600">Please wait while we complete your login.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
