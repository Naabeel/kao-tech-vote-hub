
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Timer, ThumbsUp, ArrowLeft } from 'lucide-react';

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

const VotingPage = ({ currentEmployee, onBack }: { 
  currentEmployee: Employee; 
  onBack: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [votingActive, setVotingActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchUserVotes();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (votingActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setVotingActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [votingActive, timeLeft]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .neq('employee_id', currentEmployee.employee_id);

      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: "Error",
          description: "Failed to load employees. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        console.log('Fetched employees:', data.length);
        setEmployees(data);
      }
    } catch (error) {
      console.error('Exception fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('voted_for_employee_id')
        .eq('voter_employee_id', currentEmployee.employee_id);

      if (error) {
        console.error('Error fetching user votes:', error);
        return;
      }

      if (data) {
        const votedEmployeeIds = data.map(vote => vote.voted_for_employee_id);
        setUserVotes(votedEmployeeIds);
        console.log('User has already voted for:', votedEmployeeIds);
      }
    } catch (error) {
      console.error('Exception fetching user votes:', error);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.name2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startVotingSession = (employee: Employee) => {
    console.log('Starting voting session for:', employee.employee_id, employee.name);
    setSelectedEmployee(employee);
    setTimeLeft(45);
    setVotingActive(true);
    setHasVoted(userVotes.includes(employee.employee_id));
  };

  const castVote = async () => {
    if (!selectedEmployee || hasVoted) return;

    console.log('Attempting to cast vote:', {
      voter: currentEmployee.employee_id,
      votedFor: selectedEmployee.employee_id,
      voterName: currentEmployee.name,
      votedForName: selectedEmployee.name
    });

    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          voter_employee_id: currentEmployee.employee_id,
          voted_for_employee_id: selectedEmployee.employee_id
        });

      if (error) {
        console.error('Database error while casting vote:', error);
        if (error.code === '23505') {
          toast({
            title: "Already Voted",
            description: "You have already voted for this employee",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to cast vote: ${error.message}`,
            variant: "destructive",
          });
        }
      } else {
        console.log('Vote cast successfully');
        setHasVoted(true);
        setUserVotes(prev => [...prev, selectedEmployee.employee_id]);
        toast({
          title: "Vote Cast!",
          description: `Your vote for ${selectedEmployee.name} ${selectedEmployee.name2 ? `(${selectedEmployee.name2})` : ''} has been recorded`,
        });
      }
    } catch (error) {
      console.error('Exception while casting vote:', error);
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const hasAlreadyVoted = (employeeId: string) => {
    return userVotes.includes(employeeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Voting Session</h1>
              <p className="text-sm text-gray-600">Logged in as: {currentEmployee.name} ({currentEmployee.employee_id})</p>
            </div>
          </div>
          
          {votingActive && (
            <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg">
              <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              <span className="font-bold text-red-600 text-sm sm:text-base">{timeLeft}s</span>
            </div>
          )}
        </div>

        {!selectedEmployee ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, employee ID, or group name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You can search by employee name, employee ID, or group name to find team members
                </p>
              </CardContent>
            </Card>

            {/* Employee List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredEmployees.map((employee) => {
                const alreadyVoted = hasAlreadyVoted(employee.employee_id);
                return (
                  <Card key={employee.employee_id} className={`hover:shadow-lg transition-shadow cursor-pointer ${alreadyVoted ? 'bg-green-50 border-green-200' : ''}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg">
                        {employee.name} {employee.name2 ? `(${employee.name2})` : ''}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">{employee.employee_id}</Badge>
                        {employee.group_name && (
                          <Badge variant="secondary" className="text-xs">{employee.group_name}</Badge>
                        )}
                        {alreadyVoted && (
                          <Badge variant="default" className="text-xs bg-green-600">Already Voted</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-xs sm:text-sm text-gray-600">Selected Idea:</h4>
                          <p className="text-xs sm:text-sm line-clamp-2">{employee.selected_idea || 'No idea selected'}</p>
                        </div>
                        <Button 
                          onClick={() => startVotingSession(employee)}
                          className="w-full"
                          size="sm"
                          disabled={!employee.selected_idea || alreadyVoted}
                          variant={alreadyVoted ? "secondary" : "default"}
                        >
                          {alreadyVoted ? 'Already Voted' : 'Vote for this Idea'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredEmployees.length === 0 && searchTerm && (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <p className="text-gray-600">No employees found matching "{searchTerm}"</p>
                  <p className="text-sm text-gray-500 mt-2">Try searching by name, employee ID, or group name</p>
                </CardContent>
              </Card>
            )}

            {employees.length === 0 && !searchTerm && (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <p className="text-gray-600">No employees available for voting</p>
                  <p className="text-sm text-gray-500 mt-2">Please check back later</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Voting Interface */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-center">
                Voting for: {selectedEmployee.name} {selectedEmployee.name2 ? `(${selectedEmployee.name2})` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-sm sm:text-lg p-2">
                  {selectedEmployee.employee_id}
                </Badge>
                {selectedEmployee.group_name && (
                  <div>
                    <Badge variant="secondary" className="text-sm p-2">
                      {selectedEmployee.group_name}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">Selected Idea:</h3>
                <p className="text-sm sm:text-base text-gray-700 bg-gray-50 p-4 rounded-lg text-center">
                  {selectedEmployee.selected_idea}
                </p>
              </div>

              <div className="text-center space-y-4">
                {votingActive && !hasVoted ? (
                  <Button 
                    onClick={castVote}
                    size="lg"
                    className="w-full max-w-xs"
                  >
                    <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Cast Your Vote
                  </Button>
                ) : hasVoted ? (
                  <div className="text-green-600 font-semibold text-sm sm:text-base">
                    ✓ Vote Cast Successfully!
                  </div>
                ) : (
                  <div className="text-red-600 font-semibold text-sm sm:text-base">
                    Voting Time Expired
                  </div>
                )}
                
                <Button 
                  onClick={() => setSelectedEmployee(null)}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  Select Another Employee
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VotingPage;
