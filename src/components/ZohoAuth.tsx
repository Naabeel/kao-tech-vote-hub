
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ZohoAuthProps {
  onSuccess: (userData: any) => void;
}

const ZohoAuth = ({ onSuccess }: ZohoAuthProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're returning from Zoho OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('zoho-auth', {
        body: { code },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/zoho-auth?action=callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.supabaseKey}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      if (result.employee) {
        onSuccess(result.employee);
        toast({
          title: "Success",
          description: "Successfully authenticated with Zoho!",
        });
      } else {
        throw new Error('Authentication failed');
      }
      
    } catch (error) {
      console.error('Zoho OAuth callback error:', error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to authenticate with Zoho",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleZohoLogin = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/zoho-auth?action=initiate`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Origin': window.location.origin,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initiate Zoho authentication');
      }

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
          {loading ? 'Authenticating...' : 'Login with Zoho'}
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          <p>Login with your Kanerika organization account</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZohoAuth;
