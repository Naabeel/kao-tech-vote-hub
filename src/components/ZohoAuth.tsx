
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
      
      // Redirect to Zoho OAuth
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
        <CardTitle className="text-center">Zoho Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleZohoLogin}
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Redirecting to Zoho...' : 'Login with Zoho'}
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          <p>Login with your Kanerika organization account</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZohoAuth;
