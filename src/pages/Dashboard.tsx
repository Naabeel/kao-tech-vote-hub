
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Users, Vote } from 'lucide-react';

interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  ideas: string;
  selected_idea: string;
  email: string;
}

const Dashboard = ({ currentEmployee, onStartVoting }: { 
  currentEmployee: Employee; 
  onStartVoting: () => void;
}) => {
  const [voteCount, setVoteCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchVoteCount();
  }, [currentEmployee]);

  const fetchVoteCount = async () => {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('voted_for_employee_id', currentEmployee.employee_id);

    if (!error && data) {
      setVoteCount(data.length);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('currentEmployee');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">KaoTech Day-2025</h1>
            <p className="text-gray-600">Innovation Voting Platform</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome, {currentEmployee.first_name} {currentEmployee.last_name}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Your Submitted Ideas:</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {currentEmployee.ideas || 'No ideas submitted'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Your Selected Idea:</h3>
                <Badge variant="default" className="text-sm p-2">
                  {currentEmployee.selected_idea || 'No idea selected'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Vote className="w-4 h-4" />
                <span>Current votes for your idea: {voteCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Start Voting</h3>
              <p className="text-gray-600 mb-4">
                Vote for innovative ideas from your colleagues
              </p>
              <Button onClick={onStartVoting} className="w-full">
                Start Voting Session
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gold-600" />
              <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
              <p className="text-gray-600 mb-4">
                View real-time rankings of top ideas
              </p>
              <Button variant="outline" className="w-full">
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
