import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  MessageSquare,
  BarChart3,
  FileText,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import FeedbackSystem from './FeedbackSystem';
import OrganizationChart from './OrganizationChart';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const { toast } = useToast();

  const { data: metrics, isLoading: metricsLoading, error } = useQuery({
    queryKey: ['/api/dashboard/metrics', user.tenant?.id],
    enabled: !!user.tenant?.id,
  });

  // Handle auth errors
  if (error && isUnauthorizedError(error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  return (
    <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="main-dashboard">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text" data-testid="heading-dashboard">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-welcome-message">
                Welcome back, {user.firstName}! Here's your {user.role === 'tenant_admin' ? 'company' : 'performance'} overview.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-white/50" data-testid="button-header-action-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zM9 17v5l-5-5h5zM15 7V2l5 5h-5z"></path>
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="relative hover:bg-white/50" data-testid="button-notifications">
                <AlertCircle className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">3</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-0 animate-fade-in" data-testid="card-total-employees">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  {metricsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-total-employees">
                      {(metrics as any)?.totalEmployees || 0}
                    </p>
                  )}
                  <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12 this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 animate-fade-in" data-testid="card-feedback-collected">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Feedback Collected</p>
                  {metricsLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-total-feedback">
                      {(metrics as any)?.totalFeedback || 0}
                    </p>
                  )}
                  <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +324 this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 animate-fade-in" data-testid="card-avg-performance">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                  {metricsLoading ? (
                    <Skeleton className="h-8 w-12 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-avg-performance">
                      {(metrics as any)?.avgPerformance || 0}%
                    </p>
                  )}
                  <p className="text-sm text-blue-600 font-medium mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5% vs last month
                  </p>
                </div>
                <div className="w-12 h-12 relative">
                  <div className="w-12 h-12 performance-ring rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {(metrics as any)?.avgPerformance || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 animate-fade-in" data-testid="card-active-reviews">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Reviews</p>
                  {metricsLoading ? (
                    <Skeleton className="h-8 w-8 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-active-reviews">
                      {(metrics as any)?.activeReviews || 0}
                    </p>
                  )}
                  <p className="text-sm text-orange-600 font-medium mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    7 due this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Overview */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-0" data-testid="card-performance-trends">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Performance Trends</CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-primary text-primary-foreground" data-testid="button-7d">7D</Button>
                    <Button size="sm" variant="ghost" data-testid="button-30d">30D</Button>
                    <Button size="sm" variant="ghost" data-testid="button-90d">90D</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                    alt="Modern office workspace" 
                    className="w-full h-full object-cover opacity-20" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid="text-chart-placeholder">
                        Performance Analytics Chart
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="glass-card border-0" data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                  data-testid="button-add-employee"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Add New Employee
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                  data-testid="button-start-review"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Start Review Cycle
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
                  data-testid="button-view-analytics"
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  View Analytics
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
                  data-testid="button-manage-settings"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Manage Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity & Feedback System */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="glass-card border-0" data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors" data-testid="activity-item-1">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400" 
                      alt="Emily Chen" 
                      className="object-cover"
                    />
                    <AvatarFallback>EC</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Emily Chen completed her quarterly review</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>

                <div className="flex items-center space-x-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors" data-testid="activity-item-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400" 
                      alt="Mike Rodriguez" 
                      className="object-cover"
                    />
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Mike Rodriguez received 5-star feedback from client</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>

                <div className="flex items-center space-x-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors" data-testid="activity-item-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400" 
                      alt="James Wilson" 
                      className="object-cover"
                    />
                    <AvatarFallback>JW</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">James Wilson started new performance goals</p>
                    <p className="text-xs text-muted-foreground">6 hours ago</p>
                  </div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Collection System */}
          <FeedbackSystem user={user} />
        </div>

        {/* Organization Structure Preview */}
        <OrganizationChart user={user} />
      </div>
    </main>
  );
}
