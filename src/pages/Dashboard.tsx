
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Users, Vote } from 'lucide-react';

interface Employee {
  employee_id: string;
  name: string;
  name2: string;
  email: string;
  selected_idea: string;
  idea1_title: string;
  idea2_title: string;
  idea3_title: string;
  problem1: string;
  problem2: string;
  problem3: string;
  solution1: string;
  solution2: string;
  solution3: string;
  roi1: string;
  roi2: string;
  roi3: string;
  architectural_diagram: string;
  group_name: string;
  hackathon_participation: string;
}

const Dashboard = ({ currentEmployee, onStartVoting, onShowLeaderboard }: { 
  currentEmployee: Employee; 
  onStartVoting: () => void;
  onShowLeaderboard: () => void;
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

  // Get all submitted ideas for display
  const submittedIdeas = [
    currentEmployee.idea1_title && { title: currentEmployee.idea1_title, problem: currentEmployee.problem1, solution: currentEmployee.solution1, roi: currentEmployee.roi1 },
    currentEmployee.idea2_title && { title: currentEmployee.idea2_title, problem: currentEmployee.problem2, solution: currentEmployee.solution2, roi: currentEmployee.roi2 },
    currentEmployee.idea3_title && { title: currentEmployee.idea3_title, problem: currentEmployee.problem3, solution: currentEmployee.solution3, roi: currentEmployee.roi3 }
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">KaoTech Day-2025</h1>
            <p className="text-sm sm:text-base text-gray-600">Innovation Voting Platform</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full sm:w-auto">
            Sign Out
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">
              Welcome, {currentEmployee.name} {currentEmployee.name2 ? `(${currentEmployee.name2})` : ''}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submittedIdeas.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Your Submitted Ideas:</h3>
                  <div className="space-y-3">
                    {submittedIdeas.map((idea, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-sm sm:text-base">{idea.title}</h4>
                        {idea.problem && <p className="text-xs sm:text-sm text-gray-600 mt-1"><strong>Problem:</strong> {idea.problem}</p>}
                        {idea.solution && <p className="text-xs sm:text-sm text-gray-600 mt-1"><strong>Solution:</strong> {idea.solution}</p>}
                        {idea.roi && <p className="text-xs sm:text-sm text-gray-600 mt-1"><strong>ROI:</strong> {idea.roi}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Your Submitted Ideas:</h3>
                  <p className="text-sm sm:text-base text-gray-700 bg-gray-50 p-3 rounded-lg">
                    No ideas submitted yet
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">Your Selected Idea:</h3>
                <Badge variant="default" className="text-xs sm:text-sm p-2">
                  {currentEmployee.selected_idea || 'No idea selected'}
                </Badge>
              </div>

              {currentEmployee.group_name && (
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Group:</h3>
                  <Badge variant="outline" className="text-xs sm:text-sm p-2">
                    {currentEmployee.group_name}
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <Vote className="w-4 h-4" />
                <span>Current votes for your selected idea: {voteCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Start Voting</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Vote for innovative ideas from your colleagues
              </p>
              <Button onClick={onStartVoting} className="w-full">
                Start Voting Session
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Leaderboard</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                View real-time rankings of top ideas
              </p>
              <Button onClick={onShowLeaderboard} variant="outline" className="w-full">
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
