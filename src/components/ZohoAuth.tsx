
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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
      // For now, we'll implement a basic email check against our database
      // In production, this would integrate with Zoho OAuth
      
      // Note: You'll need to replace this with actual Zoho OAuth integration
      // This is a placeholder implementation
      
      const response = await fetch('/api/auth/zoho', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        onSuccess(userData);
      } else {
        throw new Error('Authentication failed');
      }
      
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with Zoho. Please check your credentials.",
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
          <p>This will redirect to your organization's Zoho login page</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZohoAuth;
