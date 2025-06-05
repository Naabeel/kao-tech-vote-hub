
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
    const state = urlParams.get('state');
    
    if (code) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string | null) => {
    setLoading(true);
    
    try {
      console.log('Processing OAuth callback');
      
      const { data, error } = await supabase.functions.invoke('zoho-auth', {
        body: { code, state }
      });
      
      if (error) {
        throw error;
      }

      if (data?.employee) {
        onSuccess(data.employee);
        toast({
          title: "Success",
          description: "Successfully authenticated with Zoho!",
        });
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error('Authentication failed');
      }
      
    } catch (error) {
      console.error('Zoho OAuth callback error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to complete Zoho authentication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleZohoLogin = async () => {
    setLoading(true);
    
    try {
      console.log('Starting Zoho authentication');
      
      // Get Zoho OAuth URL directly
      const { data, error } = await supabase.functions.invoke('zoho-auth', {
        body: { action: 'get_auth_url' }
      });
      
      if (error) {
        throw error;
      }

      if (data?.authUrl) {
        // Redirect to Zoho OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get authentication URL');
      }
      
    } catch (error) {
      console.error('Zoho auth error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate with Zoho. Please try again.",
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
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Redirecting...' : 'Login with Zoho'}
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          <p>This will redirect you to Zoho for secure authentication</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZohoAuth;
