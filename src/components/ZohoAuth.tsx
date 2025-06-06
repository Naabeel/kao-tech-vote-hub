
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ZohoAuthProps {
  onSuccess: (userData: any) => void;
}

const ZohoAuth = ({ onSuccess }: ZohoAuthProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleZohoLogin = async () => {
    setLoading(true);
    
    try {
      console.log('Initiating Zoho OAuth flow...');
      
      const response = await fetch(
        `https://ktycwyftnqflwopupnik.supabase.co/functions/v1/zoho-auth?action=initiate`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0eWN3eWZ0bnFmbHdvcHVwbmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NDIyNTYsImV4cCI6MjA2NDUxODI1Nn0.sbc_jdSL6yxJwBIJGfCxp5-C6szkkbsdneYK-6RADIw`,
            'Origin': window.location.origin,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initiate Zoho authentication');
      }

      console.log('Redirecting to Zoho OAuth URL:', result.authUrl);
      
      // Redirect to Zoho OAuth - this will prompt for login every time
      window.location.href = result.authUrl;
      
    } catch (error) {
      console.error('Zoho auth initiation error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to initiate Zoho authentication. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Zoho SSO Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          <p className="mb-2">Click below to authenticate with your Kanerika Zoho account.</p>
          <p className="text-xs text-blue-600 mb-2">
            ✓ You will be redirected to Zoho to enter your email and password
          </p>
          <p className="text-xs text-blue-600 mb-2">
            ✓ Only @kanerika.com emails are allowed
          </p>
          <p className="text-xs text-orange-600">
            Note: You will need to sign in with your Zoho credentials each time.
          </p>
        </div>
        
        <Button 
          onClick={handleZohoLogin}
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Redirecting to Zoho...' : 'Login with Zoho SSO'}
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          <p>Authenticate with your Kanerika organization Zoho account</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZohoAuth;
