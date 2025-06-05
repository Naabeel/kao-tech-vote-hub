
import React, { useState } from 'react';
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

  const handleZohoLogin = async () => {
    setLoading(true);
    
    try {
      // Call our Supabase Edge Function for secure Zoho authentication
      const { data, error } = await supabase.functions.invoke('zoho-auth', {
        body: { email }
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
      } else {
        throw new Error('Authentication failed');
      }
      
    } catch (error) {
      console.error('Zoho auth error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with Zoho. Please check your email and try again.",
        variant: "destructive",
      });
    } finally {
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
          <p>This will verify your email against our organization database</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZohoAuth;
