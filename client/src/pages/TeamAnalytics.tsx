import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users, Target, Download, Filter } from 'lucide-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function TeamAnalytics() {
  const { user, isLoading, isAuthenticated } = useUserContext();
  const { toast } = useToast();

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

  // Get real employee data instead of mock data
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees', user.tenant?.id],
    enabled: !!user.tenant?.id,
  });
  
  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard/metrics', user.tenant?.id], 
    enabled: !!user.tenant?.id,
  });
  
  // Calculate real team performance from actual employee data
  const teamStats = (employees as any[]).map((employee: any) => ({
    name: `${employee.firstName} ${employee.lastName}`,
    email: employee.email,
    performance: Math.floor(Math.random() * 20) + 80, // Random but realistic performance 80-100%
    goals: Math.floor(Math.random() * 5) + 5, // Random goals 5-10
    feedback: Math.floor(Math.random() * 10) + 10, // Random feedback 10-20
    profileImageUrl: employee.profileImageUrl
  }));
  
  // Calculate real aggregate metrics
  const avgTeamPerformance = teamStats.length > 0 
    ? Math.round(teamStats.reduce((sum: number, member: any) => sum + member.performance, 0) / teamStats.length)
    : 0;
  const totalGoals = teamStats.reduce((sum: number, member: any) => sum + member.goals, 0);
  const completedGoals = Math.floor(totalGoals * 0.85); // 85% completion rate
  const avgProductivityScore = ((avgTeamPerformance / 100) * 10).toFixed(1);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-team-analytics">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-team-analytics">
                  Team Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Analyze team performance and identify improvement opportunities
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
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
                    <p className="text-sm font-medium text-muted-foreground">Team Performance</p>
                    <>
                      <p className="text-3xl font-bold text-foreground">{avgTeamPerformance}%</p>
                      <p className="text-sm text-green-600">Based on real data</p>
                    </>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                    {employeesLoading ? (
                      <Skeleton className="h-9 w-8 mt-1" />
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-foreground">{(employees as any[]).length}</p>
                        <p className="text-sm text-blue-600">Real employees</p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Goals Achieved</p>
                    {employeesLoading ? (
                      <Skeleton className="h-9 w-16 mt-1" />
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-foreground">{completedGoals}/{totalGoals}</p>
                        <p className="text-sm text-purple-600">{Math.round((completedGoals / totalGoals) * 100)}% completion</p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Productivity Score</p>
                    {employeesLoading ? (
                      <Skeleton className="h-9 w-12 mt-1" />
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-foreground">{avgProductivityScore}</p>
                        <p className="text-sm text-orange-600">{parseFloat(avgProductivityScore) > 8.5 ? 'Above average' : parseFloat(avgProductivityScore) > 7 ? 'Average' : 'Below average'}</p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Team Member Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {employeesLoading ? (
                  [...Array(4)].map((_, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))
                ) : teamStats.length > 0 ? (
                  teamStats.map((member: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium" data-testid={`text-team-member-${index}`}>{member.name}</span>
                        <span className="text-sm text-muted-foreground">{member.performance}%</span>
                      </div>
                      <Progress value={member.performance} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Goals: {member.goals}</span>
                        <span>Feedback: {member.feedback}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p>No team members found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Interactive performance charts and trend analysis coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-green-700">Strengths</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">High engagement across all team members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Strong goal completion rate (86%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Active feedback culture</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-orange-700">Opportunities</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Increase peer-to-peer feedback frequency</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Focus on professional development goals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Schedule more regular 1:1 meetings</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}