
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Users, Vote, LogOut, User } from 'lucide-react';

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
    console.log('Dashboard loaded for employee:', currentEmployee);
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
    try {
      if (!currentEmployee.employee_id) {
        console.warn('No employee_id available for vote count fetch');
        return;
      }

      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('voted_for_employee_id', currentEmployee.employee_id);

      if (error) {
        console.error('Error fetching vote count:', error);
        return;
      }

      if (data) {
        console.log('Vote count fetched:', data.length);
        setVoteCount(data.length);
      }
    } catch (error) {
      console.error('Exception fetching vote count:', error);
    }
  };

  const handleSignOut = () => {
    console.log('Signing out user:', currentEmployee.employee_id);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">KaoTech Day-2025</h1>
                <p className="text-xs text-gray-500">Innovation Platform</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {currentEmployee.name} {currentEmployee.name2 ? `(${currentEmployee.name2})` : ''}
                </span>
                <Badge variant="outline" className="text-xs">
                  {currentEmployee.employee_id}
                </Badge>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to the Innovation Hub</h2>
            <p className="text-lg text-gray-600">Share your ideas, vote for innovation, and drive change</p>
          </div>
        </div>

        {/* Stats & Quick Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* User Stats Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Selected Idea:</p>
                <Badge variant="default" className="text-xs">
                  {currentEmployee.selected_idea || 'No idea selected'}
                </Badge>
              </div>

              {currentEmployee.group_name && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Group:</p>
                  <Badge variant="outline" className="text-xs">
                    {currentEmployee.group_name}
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <Vote className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {voteCount} votes received
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start Voting</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Explore and vote for innovative ideas from your colleagues
                </p>
                <Button onClick={onStartVoting} className="w-full">
                  Start Voting
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">View Leaderboard</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Check the current rankings and see top-voted ideas
                </p>
                <Button onClick={onShowLeaderboard} variant="outline" className="w-full">
                  View Results
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ideas Section */}
        <div className="mb-8">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Your Submitted Ideas</CardTitle>
                <Badge variant="secondary" className="text-sm">
                  {submittedIdeas.length} idea{submittedIdeas.length !== 1 ? 's' : ''} submitted
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {submittedIdeas.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {submittedIdeas.map((idea, index) => (
                    <Card key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-blue-700 text-sm">
                            Idea {index + 1}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {idea.title}
                          </Badge>
                        </div>
                        
                        {idea.problem && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">Problem Statement:</p>
                            <p className="text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-l-red-200">
                              {idea.problem}
                            </p>
                          </div>
                        )}
                        
                        {idea.solution && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">Proposed Solution:</p>
                            <p className="text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-l-green-200">
                              {idea.solution}
                            </p>
                          </div>
                        )}
                        
                        {idea.roi && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Expected ROI:</p>
                            <p className="text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-l-yellow-200">
                              {idea.roi}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Ideas Submitted Yet</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Your submitted ideas will appear here. Ideas are imported from your Excel submissions and will be visible once uploaded by the admin.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
