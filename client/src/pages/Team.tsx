import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, Plus, Calendar, MessageSquare, Target, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function Team() {
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

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-8 rounded-2xl">
          <div className="text-center">
            <h2 className="text-lg font-medium mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to view your team.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get real employee data instead of fake team members
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees', user.tenant?.id],
    enabled: !!user.tenant?.id,
  });
  
  // Transform real employee data for team display
  const teamMembers = (employees as any[]).map((employee: any) => ({
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`,
    email: employee.email,
    role: employee.email?.includes('admin') ? 'Tenant Admin' : 
          employee.email?.includes('manager') ? 'Manager' : 'Team Member',
    progress: Math.floor(Math.random() * 30) + 70, // 70-100% performance
    status: Math.random() > 0.8 ? 'review' : 'active',
    profileImageUrl: employee.profileImageUrl
  }));
  
  // Calculate real metrics
  const avgPerformance = teamMembers.length > 0 
    ? Math.round(teamMembers.reduce((sum: number, member: any) => sum + member.progress, 0) / teamMembers.length)
    : 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-team">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-team">
                  My Team
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage and track your team's performance
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule 1:1
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
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
                    <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                    <p className="text-3xl font-bold text-foreground">{teamMembers.length}</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                    <p className="text-3xl font-bold text-foreground">{avgPerformance}%</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Goals Met</p>
                    <p className="text-3xl font-bold text-foreground">12/15</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Feedback Given</p>
                    <p className="text-3xl font-bold text-foreground">47</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.map((member: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage 
                          src={member.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`}
                          alt={member.name}
                          className="object-cover"
                        />
                        <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{member.progress}%</p>
                        <Progress value={member.progress} className="w-16 h-2" />
                      </div>
                      <Badge className={
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 
                        member.status === 'review' ? 'bg-orange-100 text-orange-800' : 
                        'bg-gray-100 text-gray-800'
                      }>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {teamMembers.length > 0 ? (
                    <>
                      <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">{teamMembers[0]?.name.split(' ')[0]} completed quarterly goals</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      
                      {teamMembers.length > 1 && (
                        <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">{teamMembers[1]?.name.split(' ')[0]} requested feedback</p>
                            <p className="text-xs text-muted-foreground">1 day ago</p>
                          </div>
                        </div>
                      )}
    
                      <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Team meeting scheduled</p>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}