import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Clock, Star, AlertCircle, Flag, Lightbulb, Users, Building, Eye, EyeOff, Hash, Filter, Search, BookOpen, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function Goals() {
  const { user, isLoading, isAuthenticated } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    category: string;
    priority: string;
    goalType: string;
    difficulty: string;
    visibility: string;
    targetDate: string;
    tags: string[];
    milestones: any[];
    notes: string;
  }>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    goalType: 'personal',
    difficulty: 'medium',
    visibility: 'private',
    targetDate: '',
    tags: [],
    milestones: [],
    notes: ''
  });
  const [currentMilestone, setCurrentMilestone] = useState({ title: '', description: '', targetDate: '' });
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get real goals data from API
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/employee', user?.employee?.id, 'goals'],
    enabled: !!user?.employee?.id && isAuthenticated,
  });
  
  const addGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const response = await fetch(`/api/employee/${user?.employee?.id}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });
      if (!response.ok) throw new Error('Failed to create goal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee', user?.employee?.id, 'goals'] });
      toast({
        title: 'Goal Created',
        description: 'Your new goal has been successfully created.',
      });
      setIsNewGoalDialogOpen(false);
      setNewGoal({ title: '', description: '', category: '', priority: 'medium', goalType: 'personal', difficulty: 'medium', visibility: 'private', targetDate: '', tags: [], milestones: [], notes: '' });
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
    if (!newGoal.title || !newGoal.category || !newGoal.targetDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    addGoalMutation.mutate(newGoal);
  };

  const addMilestone = () => {
    if (!currentMilestone.title) return;
    setNewGoal({
      ...newGoal,
      milestones: [...newGoal.milestones, { ...currentMilestone, id: Date.now() }]
    });
    setCurrentMilestone({ title: '', description: '', targetDate: '' });
  };

  const removeMilestone = (id: number) => {
    setNewGoal({
      ...newGoal,
      milestones: newGoal.milestones.filter((m: any) => m.id !== id)
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Lightbulb className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'hard': return <AlertCircle className="w-4 h-4" />;
      case 'expert': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
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

  // Filter and search goals
  const filteredGoals = goalsArray.filter((goal: any) => {
    const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesCategory && matchesSearch;
  });

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
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" data-testid="button-new-goal">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="text-2xl font-bold gradient-text">Create New Goal</DialogTitle>
                      <p className="text-muted-foreground">Set up a comprehensive goal with milestones and tracking</p>
                    </DialogHeader>
                    <div className="space-y-8 pt-6">
                      {/* Basic Information */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center">
                          <Target className="w-5 h-5 mr-2 text-blue-600" />
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="goalTitle" className="text-sm font-medium">Goal Title *</Label>
                            <Input
                              id="goalTitle"
                              value={newGoal.title}
                              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                              placeholder="e.g., Complete React certification"
                              className="h-11"
                              data-testid="input-goal-title"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="goalDescription" className="text-sm font-medium">Description</Label>
                            <Textarea
                              id="goalDescription"
                              value={newGoal.description}
                              onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                              placeholder="Provide detailed description of what you want to achieve..."
                              rows={3}
                              data-testid="input-goal-description"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Goal Configuration */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center">
                          <Flag className="w-5 h-5 mr-2 text-purple-600" />
                          Goal Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Category *</Label>
                            <Select onValueChange={(value) => setNewGoal({...newGoal, category: value})}>
                              <SelectTrigger className="h-11" data-testid="select-goal-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="professional">🚀 Professional Development</SelectItem>
                                <SelectItem value="team">👥 Team Development</SelectItem>
                                <SelectItem value="product">📦 Product Development</SelectItem>
                                <SelectItem value="leadership">👑 Leadership</SelectItem>
                                <SelectItem value="personal">🌱 Personal Growth</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Priority Level</Label>
                            <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({...newGoal, priority: value})}>
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">🔴 High Priority</SelectItem>
                                <SelectItem value="medium">🟠 Medium Priority</SelectItem>
                                <SelectItem value="low">🟢 Low Priority</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Goal Type</Label>
                            <Select value={newGoal.goalType} onValueChange={(value) => setNewGoal({...newGoal, goalType: value})}>
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="personal">👤 Personal</SelectItem>
                                <SelectItem value="team">👥 Team</SelectItem>
                                <SelectItem value="department">🏢 Department</SelectItem>
                                <SelectItem value="company">🏛️ Company</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Difficulty</Label>
                            <Select value={newGoal.difficulty} onValueChange={(value) => setNewGoal({...newGoal, difficulty: value})}>
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">💡 Easy</SelectItem>
                                <SelectItem value="medium">🎯 Medium</SelectItem>
                                <SelectItem value="hard">⚠️ Hard</SelectItem>
                                <SelectItem value="expert">⚡ Expert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Visibility</Label>
                            <Select value={newGoal.visibility} onValueChange={(value) => setNewGoal({...newGoal, visibility: value})}>
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="private">🔒 Private</SelectItem>
                                <SelectItem value="team">👥 Team Visible</SelectItem>
                                <SelectItem value="public">🌍 Public</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="goalDeadline" className="text-sm font-medium">Target Date *</Label>
                            <Input
                              id="goalDeadline"
                              type="date"
                              value={newGoal.targetDate}
                              onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                              className="h-11"
                              data-testid="input-goal-deadline"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                          Milestones (Optional)
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                              placeholder="Milestone title"
                              value={currentMilestone.title}
                              onChange={(e) => setCurrentMilestone({...currentMilestone, title: e.target.value})}
                            />
                            <Input
                              placeholder="Description (optional)"
                              value={currentMilestone.description}
                              onChange={(e) => setCurrentMilestone({...currentMilestone, description: e.target.value})}
                            />
                            <div className="flex space-x-2">
                              <Input
                                type="date"
                                value={currentMilestone.targetDate}
                                onChange={(e) => setCurrentMilestone({...currentMilestone, targetDate: e.target.value})}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={addMilestone}
                                disabled={!currentMilestone.title}
                                className="px-3"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {newGoal.milestones && newGoal.milestones.length > 0 && (
                            <div className="space-y-2">
                              {newGoal.milestones.map((milestone: any) => (
                                <div key={milestone.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                  <div>
                                    <span className="font-medium">{milestone.title}</span>
                                    {milestone.description && (
                                      <span className="text-sm text-muted-foreground ml-2">- {milestone.description}</span>
                                    )}
                                    {milestone.targetDate && (
                                      <span className="text-xs text-muted-foreground ml-2">Due: {milestone.targetDate}</span>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMilestone(milestone.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                          Additional Notes
                        </h3>
                        <Textarea
                          value={newGoal.notes}
                          onChange={(e) => setNewGoal({...newGoal, notes: e.target.value})}
                          placeholder="Add any additional notes, resources, or context for this goal..."
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsNewGoalDialogOpen(false)}
                          data-testid="button-cancel-goal"
                          className="px-6"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddGoal}
                          disabled={addGoalMutation.isPending}
                          data-testid="button-save-goal"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
                        >
                          {addGoalMutation.isPending ? 'Creating Goal...' : 'Create Goal'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Filter and Search Section */}
        <div className="p-8 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟠 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-44">
                  <Hash className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="professional">🚀 Professional</SelectItem>
                  <SelectItem value="team">👥 Team</SelectItem>
                  <SelectItem value="product">📦 Product</SelectItem>
                  <SelectItem value="leadership">👑 Leadership</SelectItem>
                  <SelectItem value="personal">🌱 Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredGoals.length} of {goalsArray.length} goals
            </div>
          </div>
        </div>

        <div className="px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card border-0 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{filteredGoals.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">of {goalsArray.length} total</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-green-600">
                      {filteredGoals.filter((g: any) => g.status === 'completed').length}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {filteredGoals.length > 0 ? Math.round((filteredGoals.filter((g: any) => g.status === 'completed').length / filteredGoals.length) * 100) : 0}% completion
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                    <p className="text-3xl font-bold text-red-600">
                      {filteredGoals.filter((g: any) => g.priority === 'high').length}
                    </p>
                    <p className="text-xs text-red-600 font-medium mt-1">urgent tasks</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                    <p className="text-3xl font-bold text-foreground">
                      {filteredGoals.length > 0 
                        ? Math.round(filteredGoals.reduce((acc: number, goal: any) => acc + (goal.progress || 0), 0) / filteredGoals.length)
                        : 0}%
                    </p>
                    <p className="text-xs text-purple-600 font-medium mt-1">overall progress</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals Grid */}
          <div className="space-y-8">
            {filteredGoals.length === 0 ? (
              <Card className="glass-card border-0">
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No goals found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || filterPriority !== 'all' || filterCategory !== 'all' 
                      ? 'No goals match your current filters. Try adjusting your search criteria.' 
                      : 'Start your journey by creating your first goal!'}
                  </p>
                  {(!searchQuery && filterPriority === 'all' && filterCategory === 'all') && (
                    <Button onClick={() => setIsNewGoalDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Goal
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGoals.map((goal: any) => (
                  <Card key={goal.id} className="glass-card border-0 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                    {/* Priority Indicator */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      goal.priority === 'high' ? 'bg-red-500' :
                      goal.priority === 'medium' ? 'bg-orange-500' :
                      'bg-green-500'
                    }`} />
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={`text-xs px-2 py-1 ${
                              goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                              goal.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {goal.priority === 'high' ? '🔴 High' :
                               goal.priority === 'medium' ? '🟠 Medium' :
                               '🟢 Low'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {goal.category === 'professional' ? '🚀 Professional' :
                               goal.category === 'team' ? '👥 Team' :
                               goal.category === 'product' ? '📦 Product' :
                               goal.category === 'leadership' ? '👑 Leadership' :
                               '🌱 Personal'}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {goal.title}
                          </CardTitle>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {goal.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          {getDifficultyIcon(goal.difficulty || 'medium')}
                          <span className="text-xs text-muted-foreground">
                            {(goal.difficulty || 'medium').charAt(0).toUpperCase() + (goal.difficulty || 'medium').slice(1)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Progress Section */}
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">Progress</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-foreground">{goal.progress || 0}%</span>
                            <Badge className={
                              goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                              goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              goal.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {goal.status === 'completed' ? '✅ Done' :
                               goal.status === 'in_progress' ? '🔄 Active' :
                               goal.status === 'on_hold' ? '⏸️ On Hold' :
                               '📋 Planned'}
                            </Badge>
                          </div>
                        </div>
                        <Progress 
                          value={goal.progress || 0} 
                          className={`h-2 ${
                            goal.status === 'completed' ? '[&>div]:bg-green-500' :
                            goal.priority === 'high' ? '[&>div]:bg-red-500' :
                            goal.priority === 'medium' ? '[&>div]:bg-orange-500' :
                            '[&>div]:bg-green-500'
                          }`}
                        />
                      </div>
                      
                      {/* Milestones */}
                      {goal.milestones && goal.milestones.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <span className="text-xs font-medium text-muted-foreground flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Milestones ({goal.milestones.filter((m: any) => m.completed).length}/{goal.milestones.length})
                          </span>
                          <div className="space-y-1">
                            {goal.milestones.slice(0, 2).map((milestone: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2 text-xs">
                                <div className={`w-2 h-2 rounded-full ${
                                  milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <span className={milestone.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                                  {milestone.title}
                                </span>
                              </div>
                            ))}
                            {goal.milestones.length > 2 && (
                              <div className="text-xs text-muted-foreground pl-4">
                                +{goal.milestones.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Goal Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Due {new Date(goal.targetDate || goal.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {goal.visibility === 'private' ? <EyeOff className="w-3 h-3" /> :
                             goal.visibility === 'team' ? <Users className="w-3 h-3" /> :
                             <Eye className="w-3 h-3" />}
                            <span className="capitalize">{goal.visibility || 'private'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-100">
                            <Star className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-green-100">
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}