
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ZohoAuthProps {
  onSuccess: (userData: any) => void;
}

const ZohoAuth = ({ onSuccess }: ZohoAuthProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're returning from Zoho OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state'); // This contains the email
    
    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code: string, email: string) => {
    setLoading(true);
    
    try {
      console.log('Processing OAuth callback');
      
      const { data, error } = await supabase.functions.invoke('zoho-auth', {
        body: { email, code }
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
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your organization email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting Zoho authentication for:', email);
      
      // First validate the email and get Zoho OAuth URL
      const { data, error } = await supabase.functions.invoke('zoho-auth', {
        body: { email }
      });
      
      if (error) {
        throw error;
      }

      if (data?.authUrl) {
        // Redirect to Zoho OAuth
        window.location.href = data.authUrl;
      } else if (data?.employee) {
        // Direct authentication (fallback)
        onSuccess(data.employee);
        toast({
          title: "Success",
          description: "Successfully authenticated!",
        });
      } else {
        throw new Error('Authentication failed');
      }
      
    } catch (error) {
      console.error('Zoho auth error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate with Zoho. Please check your email and try again.",
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
        <div>
          <label htmlFor="zoho-email" className="block text-sm font-medium text-gray-700 mb-1">
            Organization Email
          </label>
          <Input
            id="zoho-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@yourcompany.com"
            required
            disabled={loading}
          />
        </div>
        
        <Button 
          onClick={handleZohoLogin}
          className="w-full"
          disabled={loading || !email}
        >
          {loading ? 'Authenticating...' : 'Login with Zoho'}
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          <p>This will redirect you to Zoho for secure authentication</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZohoAuth;
