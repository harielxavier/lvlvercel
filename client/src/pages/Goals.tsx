import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function Goals() {
  const { user, isLoading, isAuthenticated } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: '',
    deadline: ''
  });
  
  // Get real goals data from API
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/employee', user.id, 'goals'],
    enabled: !!user?.id && isAuthenticated,
  });
  
  const addGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const response = await fetch(`/api/employee/${user.id}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });
      if (!response.ok) throw new Error('Failed to create goal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee', user.id, 'goals'] });
      toast({
        title: 'Goal Created',
        description: 'Your new goal has been successfully created.',
      });
      setIsNewGoalDialogOpen(false);
      setNewGoal({ title: '', description: '', category: '', deadline: '' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create goal',
        variant: 'destructive'
      });
    }
  });
  
  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.category || !newGoal.deadline) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    addGoalMutation.mutate(newGoal);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics from real goals data
  const goalsArray = Array.isArray(goals) ? goals : [];
  const completedGoals = goalsArray.filter((g: any) => g.status === 'completed');
  const inProgressGoals = goalsArray.filter((g: any) => g.status === 'in_progress');
  const avgProgress = goalsArray.length > 0 
    ? Math.round(goalsArray.reduce((acc: number, goal: any) => acc + (goal.progress || 0), 0) / goalsArray.length)
    : 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-goals">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-goals">
                  {user.role === 'employee' ? 'Goals & Development' : 'Goal Management'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {user.role === 'employee' ? 'Track your personal and professional goals' : 'Manage team goals and development plans'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
                <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90" data-testid="button-new-goal">
                      <Plus className="w-4 h-4 mr-2" />
                      New Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="goalTitle">Goal Title *</Label>
                        <Input
                          id="goalTitle"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                          placeholder="Enter goal title"
                          data-testid="input-goal-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goalDescription">Description</Label>
                        <Textarea
                          id="goalDescription"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                          placeholder="Describe your goal"
                          rows={3}
                          data-testid="input-goal-description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goalCategory">Category *</Label>
                        <Select onValueChange={(value) => setNewGoal({...newGoal, category: value})}>
                          <SelectTrigger data-testid="select-goal-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional Development</SelectItem>
                            <SelectItem value="team">Team Development</SelectItem>
                            <SelectItem value="product">Product Development</SelectItem>
                            <SelectItem value="leadership">Leadership</SelectItem>
                            <SelectItem value="personal">Personal Growth</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goalDeadline">Deadline *</Label>
                        <Input
                          id="goalDeadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                          data-testid="input-goal-deadline"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsNewGoalDialogOpen(false)}
                          data-testid="button-cancel-goal"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddGoal}
                          disabled={addGoalMutation.isPending}
                          data-testid="button-save-goal"
                        >
                          {addGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                    {goalsLoading ? (
                      <Skeleton className="h-9 w-8 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{goalsArray.length}</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    {goalsLoading ? (
                      <Skeleton className="h-9 w-8 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-green-600">
                        {completedGoals.length}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    {goalsLoading ? (
                      <Skeleton className="h-9 w-8 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-orange-600">
                        {inProgressGoals.length}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                    {goalsLoading ? (
                      <Skeleton className="h-9 w-12 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">
                        {avgProgress}%
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Active Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {goalsArray.filter((goal: any) => goal.status !== 'completed').map((goal: any) => (
                  <div key={goal.id} className="space-y-3 p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                      </div>
                      <Badge className={
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {goal.progress}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {goal.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Due {goal.deadline}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Completed Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goalsArray.filter((goal: any) => goal.status === 'completed').map((goal: any) => (
                  <div key={goal.id} className="flex items-center justify-between p-4 bg-green-50/50 rounded-lg border border-green-200/50">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">{goal.title}</h4>
                        <p className="text-sm text-green-700/70 mt-1">{goal.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                            {goal.category}
                          </Badge>
                          <span className="text-xs text-green-600">Completed {goal.deadline}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}