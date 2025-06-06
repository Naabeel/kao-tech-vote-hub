
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error('Authentication was denied. Please try again.');
        }

        if (!code) {
          throw new Error('Authentication failed. Please try logging in again.');
        }

        console.log('Processing OAuth callback with code:', code);

        // Call the edge function to handle the callback
        const response = await fetch(
          `https://ktycwyftnqflwopupnik.supabase.co/functions/v1/zoho-auth?action=callback`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0eWN3eWZ0bnFmbHdvcHVwbmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NDIyNTYsImV4cCI6MjA2NDUxODI1Nn0.sbc_jdSL6yxJwBIJGfCxp5-C6szkkbsdneYK-6RADIw`,
            },
            body: JSON.stringify({ code }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          let errorMessage = 'Authentication failed. Please try again.';
          
          if (response.status === 403) {
            errorMessage = 'Access denied: Only Kanerika organization emails are allowed.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid authentication request. Please try again.';
          } else if (response.status === 500) {
            errorMessage = 'Authentication service temporarily unavailable. Please try again later.';
          }
          
          throw new Error(errorMessage);
        }

        if (result.employee) {
          // Store user data temporarily in sessionStorage for the redirect
          // This will be picked up by the main app and moved to memory
          sessionStorage.setItem('tempUserData', JSON.stringify(result.employee));
          
          toast({
            title: "Welcome!",
            description: `Successfully authenticated as ${result.employee.name}`,
          });

          console.log('Zoho authentication successful');
          navigate('/', { replace: true });
        } else {
          throw new Error('Authentication completed but user profile could not be created.');
        }
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        
        let errorMessage = "Authentication failed. Please try again.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        navigate('/', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Authenticating with Zoho...</h2>
        <p className="text-gray-600">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
