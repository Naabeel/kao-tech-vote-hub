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

interface DashboardProps {
  currentEmployee: Employee;
  onStartVoting: () => void;
  onShowLeaderboard: () => void;
  onSignOut: () => void;
}

const Dashboard = ({ currentEmployee, onStartVoting, onShowLeaderboard, onSignOut }: DashboardProps) => {
  const [voteCount, setVoteCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchVoteCount();
    
    // Check for temporary user data from Zoho callback
    const tempUserData = sessionStorage.getItem('tempUserData');
    if (tempUserData) {
      // Clear the temporary data immediately for security
      sessionStorage.removeItem('tempUserData');
      console.log('Temporary Zoho user data cleared from storage');
    }
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
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    
    onSignOut();
  };

  const submittedIdeas = [
    currentEmployee.idea1_title && { 
      title: currentEmployee.idea1_title, 
      problem: currentEmployee.problem1, 
      solution: currentEmployee.solution1, 
      roi: currentEmployee.roi1 
    },
    currentEmployee.idea2_title && { 
      title: currentEmployee.idea2_title, 
      problem: currentEmployee.problem2, 
      solution: currentEmployee.solution2, 
      roi: currentEmployee.roi2 
    },
    currentEmployee.idea3_title && { 
      title: currentEmployee.idea3_title, 
      problem: currentEmployee.problem3, 
      solution: currentEmployee.solution3, 
      roi: currentEmployee.roi3 
    }
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">KaoTech Day-2025</h1>
            <p className="text-sm sm:text-base text-gray-600">Innovation Voting Platform</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full sm:w-auto">
            Sign Out
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1">
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Welcome, {currentEmployee.name} {currentEmployee.name2 ? `(${currentEmployee.name2})` : ''}!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">Selected Idea:</h4>
                  <Badge variant="default" className="text-xs p-1">
                    {currentEmployee.selected_idea || 'No idea selected'}
                  </Badge>
                </div>

                {currentEmployee.group_name && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Group:</h4>
                    <Badge variant="outline" className="text-xs p-1">
                      {currentEmployee.group_name}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Vote className="w-3 h-3" />
                  <span>Votes received: {voteCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="text-sm font-semibold mb-1">Start Voting</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Vote for innovative ideas
                  </p>
                  <Button onClick={onStartVoting} size="sm" className="w-full">
                    Start Voting
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <h3 className="text-sm font-semibold mb-1">Leaderboard</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    View rankings
                  </p>
                  <Button onClick={onShowLeaderboard} variant="outline" size="sm" className="w-full">
                    View Results
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Ideas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Submitted Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                {submittedIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {submittedIdeas.map((idea, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="font-medium text-sm mb-2 text-blue-700">
                          Idea {index + 1}: {idea.title}
                        </h4>
                        {idea.problem && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-700">Problem:</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{idea.problem}</p>
                          </div>
                        )}
                        {idea.solution && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-700">Solution:</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{idea.solution}</p>
                          </div>
                        )}
                        {idea.roi && (
                          <div>
                            <p className="text-xs font-medium text-gray-700">ROI:</p>
                            <p className="text-xs text-gray-600 line-clamp-1">{idea.roi}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      No ideas submitted yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
