
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
        const errorDescription = urlParams.get('error_description');

        if (error) {
          throw new Error(`OAuth error: ${error} - ${errorDescription || 'Unknown error'}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Zoho');
        }

        console.log('Processing OAuth callback with code:', code);

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
          // Show more specific error messages
          const errorMessage = result.error || 'Authentication failed';
          throw new Error(errorMessage);
        }

        if (result.employee) {
          // Store employee data and redirect to main page
          localStorage.setItem('currentEmployee', JSON.stringify(result.employee));
          
          toast({
            title: "Welcome!",
            description: `Successfully authenticated as ${result.employee.name}`,
          });
          
          navigate('/', { replace: true });
        } else {
          throw new Error('Authentication failed - no employee data received');
        }
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        
        // Show more user-friendly error messages
        let errorMessage = "Failed to authenticate with Zoho";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Redirect back to home page on error
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
        <p className="text-gray-600">Please wait while we verify your credentials and complete the login process.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
