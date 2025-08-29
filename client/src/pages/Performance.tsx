import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Target, TrendingUp, Award, Plus, Star } from 'lucide-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

export default function Performance() {
  const { user, isLoading, isAuthenticated } = useUserContext();
  const { toast } = useToast();
  
  // Get current user's employee data
  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ['/api/user/employee'],
    retry: false,
    enabled: !!user,
  });

  // Get employee goals
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/employee', (employee as any)?.id, 'goals'],
    enabled: !!(employee as any)?.id,
    retry: false,
  });

  // Get employee feedback
  const { data: feedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['/api/employee', (employee as any)?.id, 'feedback'],
    enabled: !!(employee as any)?.id,
    retry: false,
  });

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

  // Calculate real performance metrics
  const goalsArray = Array.isArray(goals) ? goals : [];
  const feedbackArray = Array.isArray(feedback) ? feedback : [];
  
  const totalGoals = goalsArray.length;
  const completedGoals = goalsArray.filter((goal: any) => goal.status === 'completed').length;
  const goalsCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  
  const avgFeedbackRating = feedbackArray.length > 0 
    ? (feedbackArray.reduce((sum: number, fb: any) => sum + (fb.rating || 0), 0) / feedbackArray.length).toFixed(1)
    : '0.0';
  
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-100 text-green-800';
    if (progress >= 50) return 'bg-blue-100 text-blue-800';
    return 'bg-orange-100 text-orange-800';
  };

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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-performance">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-performance">
                  {user.role === 'employee' ? 'My Performance' : 'Performance Management'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {user.role === 'employee' ? 'Track your goals and progress' : 'Manage team performance and development'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href={user.role === 'employee' ? '/goals' : '/reviews'}>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    {user.role === 'employee' ? 'Set Goal' : 'New Review'}
                  </Button>
                </Link>
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
                    <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                    <p className="text-3xl font-bold text-foreground">{avgFeedbackRating}</p>
                    <p className="text-sm text-green-600">Based on {feedbackArray.length} reviews</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Goals Complete</p>
                    <p className="text-3xl font-bold text-foreground">{goalsCompletionRate}%</p>
                    <p className="text-sm text-blue-600">{completedGoals} of {totalGoals} goals</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Feedback Score</p>
                    <p className="text-3xl font-bold text-foreground">{avgFeedbackRating}</p>
                    <p className="text-sm text-purple-600">Average rating</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Growth</p>
                    <p className="text-3xl font-bold text-foreground">+12%</p>
                    <p className="text-sm text-orange-600">This quarter</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Current Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goalsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : goalsArray.length > 0 ? (
                  goalsArray.slice(0, 5).map((goal: any) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{goal.title}</span>
                        <Badge className={getProgressColor(goal.progress || 0)}>
                          {goal.progress || 0}%
                        </Badge>
                      </div>
                      <Progress value={goal.progress || 0} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Goals Set</h3>
                    <p className="text-muted-foreground mb-4">
                      Set your first performance goal to get started.
                    </p>
                    <Link href="/goals">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Set Goal
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedbackLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : feedbackArray.length > 0 ? (
                  feedbackArray.slice(0, 3).map((fb: any) => (
                    <div key={fb.id} className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {Array.from({ length: fb.rating || 0 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {fb.rating}/5
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{fb.comments}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From: {fb.giverName || fb.relationship || 'Anonymous'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Feedback Yet</h3>
                    <p className="text-muted-foreground">
                      Share your feedback link to start collecting performance reviews.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}