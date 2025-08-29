import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  MessageSquare,
  DollarSign,
  Activity,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function PlatformAnalytics() {
  const { toast } = useToast();
  
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['/api/platform/metrics']
  });

  const { data: tenants } = useQuery({
    queryKey: ['/api/platform/tenants']
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
    return null;
  }

  const tierDistribution = tenants?.reduce((acc: any, tenant: any) => {
    acc[tenant.subscriptionTier] = (acc[tenant.subscriptionTier] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-platform-analytics">
      {/* Header */}
      <header className="glass-morphism border-b sticky top-0 z-40">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text" data-testid="heading-platform-analytics">
                Platform Analytics
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-analytics-description">
                Comprehensive insights across all customer tenants and platform performance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Key Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-0 animate-fade-in" data-testid="card-total-tenants">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customer Tenants</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-total-tenants">
                      {metrics?.totalTenants || 0}
                    </p>
                  )}
                  <p className="text-sm text-primary font-medium mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Ready to scale
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 animate-fade-in" data-testid="card-total-users">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Platform Users</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-total-users">
                      {metrics?.totalUsers || 0}
                    </p>
                  )}
                  <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    Active platform users
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 animate-fade-in" data-testid="card-total-feedback">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Feedback Collected</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-total-feedback">
                      {metrics?.totalFeedback || 0}
                    </p>
                  )}
                  <p className="text-sm text-blue-600 font-medium mt-1 flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Platform-wide feedback
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 animate-fade-in" data-testid="card-revenue">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-revenue">
                      ${metrics?.monthlyRecurringRevenue || 0}
                    </p>
                  )}
                  <p className="text-sm text-orange-600 font-medium mt-1 flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Ready to generate revenue
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Tier Distribution */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary" />
              Subscription Tier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries({
                mj_scott: 'MJ Scott (FREE)',
                forming: 'Forming ($5)',
                storming: 'Storming ($10)',
                norming: 'Norming ($15)',
                performing: 'Performing ($20)',
                appsumo: 'AppSumo (FREE)'
              }).map(([tier, name]) => (
                <div key={tier} className="text-center p-4 rounded-lg bg-muted/20">
                  <p className="text-2xl font-bold text-foreground">
                    {tierDistribution[tier] || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Health Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Platform Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Database</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Authentication</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Multi-tenant System</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Ready</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium">Customer Onboarding</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" />
                Platform Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Pricing Tiers Configured</span>
                  <Badge className="bg-green-100 text-green-800">6/6 Complete</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Role System</span>
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Multi-tenant Architecture</span>
                  <Badge className="bg-green-100 text-green-800">Implemented</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Platform Super Admins</span>
                  <Badge className="bg-green-100 text-green-800">3 Active</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Customer Onboarding Process</span>
                  <Badge className="bg-green-100 text-green-800">Ready</Badge>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">🚀 Platform Ready</p>
                    <p className="text-sm text-muted-foreground">Ready for customer acquisition</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}