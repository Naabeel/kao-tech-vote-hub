import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';

interface LeaderboardEntry {
  employee_id: string;
  first_name: string;
  last_name: string;
  selected_idea: string;
  vote_count: number;
}

const Leaderboard = ({ onBack }: { onBack: () => void }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    
    // Set up real-time updates
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('employees')
      .select(`
        employee_id,
        first_name,
        last_name,
        selected_idea,
        votes:votes!voted_for_employee_id(count)
      `);

    if (!error && data) {
      const leaderboardData = data
        .map(employee => ({
          ...employee,
          vote_count: employee.votes[0]?.count || 0
        }))
        .sort((a, b) => {
          // If vote counts are the same (including 0), sort alphabetically by name
          if (a.vote_count === b.vote_count) {
            const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
            const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
            return nameA.localeCompare(nameB);
          }
          // Otherwise sort by vote count (highest first)
          return b.vote_count - a.vote_count;
        })
        .slice(0, 20); // Top 20

      setLeaderboard(leaderboardData);
    }
    
    setLoading(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">{index + 1}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Live Leaderboard</h1>
          </div>
          
          <Badge variant="secondary" className="text-sm">
            Live Updates
          </Badge>
        </div>

        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <Card key={entry.employee_id} className={`transition-all duration-300 ${
              index < 3 ? 'border-2 border-yellow-200 bg-yellow-50' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getRankIcon(index)}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {entry.first_name} {entry.last_name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {entry.employee_id}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {entry.vote_count}
                    </div>
                    <div className="text-sm text-gray-600">
                      {entry.vote_count === 1 ? 'vote' : 'votes'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-1">Innovation Idea:</h4>
                  <p className="text-gray-600 bg-white p-3 rounded-lg">
                    {entry.selected_idea}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">No employees found. Please check your database.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
