
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
  first_name: string;
  last_name: string;
  ideas: string;
  selected_idea: string;
  email: string;
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
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
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
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .neq('employee_id', currentEmployee.employee_id); // Exclude current employee

    if (!error && data) {
      setEmployees(data);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startVotingSession = (employee: Employee) => {
    setSelectedEmployee(employee);
    setTimeLeft(45);
    setVotingActive(true);
    setHasVoted(false);
  };

  const castVote = async () => {
    if (!selectedEmployee || hasVoted) return;

    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          voter_employee_id: currentEmployee.employee_id,
          voted_for_employee_id: selectedEmployee.employee_id
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Voted",
            description: "You have already voted for this employee",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        setHasVoted(true);
        toast({
          title: "Vote Cast!",
          description: `Your vote for ${selectedEmployee.first_name} ${selectedEmployee.last_name} has been recorded`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Voting Session</h1>
          </div>
          
          {votingActive && (
            <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-lg">
              <Timer className="w-5 h-5 text-red-600" />
              <span className="font-bold text-red-600">{timeLeft}s</span>
            </div>
          )}
        </div>

        {!selectedEmployee ? (
          <div className="space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search employee by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Employee List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((employee) => (
                <Card key={employee.employee_id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {employee.first_name} {employee.last_name}
                    </CardTitle>
                    <Badge variant="outline">{employee.employee_id}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600">Selected Idea:</h4>
                        <p className="text-sm">{employee.selected_idea}</p>
                      </div>
                      <Button 
                        onClick={() => startVotingSession(employee)}
                        className="w-full"
                        size="sm"
                      >
                        Vote for this Idea
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Voting Interface */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Voting for: {selectedEmployee.first_name} {selectedEmployee.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant="outline" className="text-lg p-2">
                  {selectedEmployee.employee_id}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Selected Idea:</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-center">
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
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    Cast Your Vote
                  </Button>
                ) : hasVoted ? (
                  <div className="text-green-600 font-semibold">
                    ✓ Vote Cast Successfully!
                  </div>
                ) : (
                  <div className="text-red-600 font-semibold">
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
