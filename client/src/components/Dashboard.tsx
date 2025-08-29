import React from 'react';
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
  AlertCircle,
  Building2,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import FeedbackSystem from './FeedbackSystem';
import OrganizationChart from './OrganizationChart';

interface DashboardProps {
  user: any;
}

function Dashboard({ user }: DashboardProps) {
  const { toast } = useToast();

  // Use different API endpoints based on user role
  const isPlatformAdmin = React.useMemo(() => user.role === 'platform_admin', [user.role]);
  const { data: metrics, isLoading: metricsLoading, error } = useQuery({
    queryKey: isPlatformAdmin ? ['/api/platform/metrics'] : ['/api/dashboard/metrics', user.tenant?.id],
    enabled: isPlatformAdmin || !!user.tenant?.id,
  });

  // Get recent activity for non-platform admin users
  const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['/api/dashboard/activity', user.tenant?.id],
    enabled: !isPlatformAdmin && !!user.tenant?.id,
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
      <header className="glass-morphism border-b sticky top-0 z-40">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text" data-testid="heading-dashboard">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-welcome-message">
                Welcome back, {user.firstName}! Here's your {user.role === 'platform_admin' ? 'platform' : user.role === 'tenant_admin' ? 'company' : 'performance'} overview.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" data-testid="button-header-action-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zM9 17v5l-5-5h5zM15 7V2l5 5h-5z"></path>
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                <AlertCircle className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-xs text-destructive-foreground font-medium">3</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        {user.role === 'platform_admin' ? (
          // Platform Admin Dashboard
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card border-0 animate-fade-in" data-testid="card-total-tenants">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Tenants</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground" data-testid="metric-total-tenants">
                        {(metrics as any)?.totalTenants || 0}
                      </p>
                    )}
                    <p className="text-sm text-primary font-medium mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Ready for onboarding
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 animate-fade-in" data-testid="card-platform-users">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Platform Users</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground" data-testid="metric-platform-users">
                        {(metrics as any)?.totalUsers || 0}
                      </p>
                    )}
                    <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Active platform users
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 animate-fade-in" data-testid="card-platform-revenue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground" data-testid="metric-platform-revenue">
                        ${(metrics as any)?.monthlyRecurringRevenue || 0}
                      </p>
                    )}
                    <p className="text-sm text-blue-600 font-medium mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Ready to generate revenue
                    </p>
                  </div>
                  <div className="w-12 h-12 relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <span className="text-lg">💰</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 animate-fade-in" data-testid="card-platform-feedback">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Platform Feedback</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-8 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground" data-testid="metric-platform-feedback">
                        {(metrics as any)?.totalFeedback || 0}
                      </p>
                    )}
                    <p className="text-sm text-orange-600 font-medium mt-1 flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Cross-tenant feedback
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Regular User Dashboard
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
                    <p className="text-sm text-primary font-medium mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12 this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
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
        )}

        {/* Main Dashboard Grid */}
        {user.role === 'platform_admin' ? (
          // Platform Admin Dashboard Content
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Platform Status */}
            <Card className="glass-card border-0" data-testid="card-platform-status">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-primary" />
                  Platform Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Platform Ready</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Customer Onboarding</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ready</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium">Multi-tenant System</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="font-medium">6 Pricing Tiers</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Configured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Quick Actions */}
            <Card className="glass-card border-0" data-testid="card-platform-actions">
              <CardHeader>
                <CardTitle>Platform Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                  data-testid="button-manage-tenants"
                >
                  <Building2 className="w-5 h-5 mr-3" />
                  Manage Customer Tenants
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                  data-testid="button-view-analytics"
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Platform Analytics
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
                  data-testid="button-billing-management"
                >
                  <Users className="w-5 h-5 mr-3" />
                  Billing & Subscriptions
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
                  data-testid="button-system-settings"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  System Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Regular User Dashboard Content
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
                  {(user.role === 'tenant_admin' || user.role === 'manager') ? (
                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                      data-testid="button-add-employee"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Add New Employee
                    </Button>
                  ) : (
                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                      data-testid="button-schedule-1v1"
                    >
                      <Calendar className="w-5 h-5 mr-3" />
                      Schedule 1v1
                    </Button>
                  )}

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
        )}

        {/* Recent Activity & System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="glass-card border-0" data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle>{user.role === 'platform_admin' ? 'Platform Activity' : 'Recent Activity'}</CardTitle>
            </CardHeader>
            <CardContent>
              {user.role === 'platform_admin' ? (
                // Platform Activity for Platform Admins
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors" data-testid="platform-activity-item-1">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Platform initialized successfully</p>
                      <p className="text-xs text-muted-foreground">System ready for customer onboarding</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors" data-testid="platform-activity-item-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">3 Platform Super Admins active</p>
                      <p className="text-xs text-muted-foreground">Mauricio, Michael, Kristen</p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors" data-testid="platform-activity-item-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">6 pricing tiers configured</p>
                      <p className="text-xs text-muted-foreground">MJ Scott to Performing tiers</p>
                    </div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors" data-testid="platform-activity-item-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Multi-tenant architecture deployed</p>
                      <p className="text-xs text-muted-foreground">Ready for tenant isolation</p>
                    </div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
              ) : activityLoading ? (
                // Loading state
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                // Real Employee Activity
                <div className="space-y-4">
                  {recentActivity.map((activity: any, index: number) => {
                    const timeAgo = new Date(activity.createdAt).toLocaleDateString();
                    const fullName = `${activity.firstName} ${activity.lastName}`;
                    const initials = `${activity.firstName?.charAt(0) || ''}${activity.lastName?.charAt(0) || ''}`.toUpperCase();
                    
                    const getActivityText = () => {
                      if (activity.type === 'employee_joined') {
                        return `${fullName} joined the team`;
                      } else if (activity.type === 'feedback_received') {
                        const stars = activity.rating ? `${activity.rating}-star` : 'positive';
                        return `${fullName} received ${stars} feedback`;
                      }
                      return `${fullName} had recent activity`;
                    };
                    
                    const getStatusColor = () => {
                      if (activity.type === 'employee_joined') return 'bg-green-500';
                      if (activity.type === 'feedback_received') return 'bg-blue-500';
                      return 'bg-purple-500';
                    };
                    
                    return (
                      <div key={activity.id || index} className="flex items-center space-x-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors" data-testid={`activity-item-${index + 1}`}>
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={activity.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.id}`}
                            alt={fullName}
                            className="object-cover"
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{getActivityText()}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // No activity state
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                  <p className="text-muted-foreground">
                    Employee activities will appear here once they start using the platform.
                  </p>
                </div>
              )}
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

export default React.memo(Dashboard);
