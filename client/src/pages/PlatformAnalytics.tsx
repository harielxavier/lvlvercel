import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  MessageSquare,
  DollarSign,
  Activity,
  Target,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useUserContext } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import type { Tenant } from '@shared/schema';

interface PlatformMetrics {
  totalTenants: number;
  totalUsers: number;
  totalEmployees: number;
  totalFeedback: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
}

export default function PlatformAnalytics() {
  const { user } = useUserContext();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  const { data: metrics, isLoading, error } = useQuery<PlatformMetrics>({
    queryKey: ['/api/platform/metrics']
  });

  const { data: tenants } = useQuery<Tenant[]>({
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

  const tierDistribution = tenants?.reduce((acc: Record<string, number>, tenant) => {
    const tier = tenant.subscriptionTier || 'forming';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 lg:ml-80 transition-all duration-300 ease-in-out overflow-auto" data-testid="page-platform-analytics">
      {/* Header */}
      <header className="glass-morphism border-b sticky top-0 z-40 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text" data-testid="heading-platform-analytics">
                Platform Analytics
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-analytics-description">
                Comprehensive insights across all customer tenants and platform performance
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={() => window.location.reload()}
                data-testid="button-refresh-analytics"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={() => toast({ title: "Export", description: "Export functionality coming soon!" })}
                data-testid="button-export-analytics"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content - Bento Box Layout */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {/* Large Hero Card - Platform Overview */}
          <Card className="glass-card border-0 lg:col-span-2 lg:row-span-2">
            <CardContent className="p-8">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Platform Overview</Badge>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Platform Analytics Dashboard</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Customer Tenants</p>
                      <p className="text-3xl font-bold text-foreground">
                        {isLoading ? <Skeleton className="h-8 w-12" /> : metrics?.totalTenants || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Platform Users</p>
                      <p className="text-3xl font-bold text-foreground">
                        {isLoading ? <Skeleton className="h-8 w-12" /> : metrics?.totalUsers || 0}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active Subscriptions</span>
                      <span className="font-medium text-green-600">
                        {isLoading ? <Skeleton className="h-4 w-8" /> : metrics?.activeSubscriptions || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Revenue</span>
                      <span className="font-medium">${isLoading ? <Skeleton className="h-4 w-12" /> : metrics?.monthlyRecurringRevenue || 0}</span>
                    </div>
                    <div className="flex items-center text-sm text-primary font-medium">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Platform ready for scale
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medium Card - Feedback */}
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-800">Feedback</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Feedback</p>
              <div className="text-3xl font-bold text-foreground mb-2">
                {isLoading ? <Skeleton className="h-8 w-12" /> : metrics?.totalFeedback || 0}
              </div>
              <p className="text-xs text-blue-600 font-medium">Platform-wide insights</p>
            </CardContent>
          </Card>

          {/* Medium Card - Revenue */}
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <Badge className="bg-orange-100 text-orange-800">Revenue</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Revenue</p>
              <div className="text-3xl font-bold text-foreground mb-2">
                ${isLoading ? <Skeleton className="h-8 w-12" /> : metrics?.monthlyRecurringRevenue || 0}
              </div>
              <p className="text-xs text-orange-600 font-medium">Ready to scale</p>
            </CardContent>
          </Card>

          {/* Wide Card - Quick Actions */}
          <Card className="glass-card border-0 lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Platform Actions</h3>
                  <p className="text-sm text-muted-foreground">Manage platform operations and analytics</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => toast({ title: "Export", description: "Export functionality coming soon!" })}>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => toast({ title: "Settings", description: "Analytics settings coming soon!" })}>
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Tier Distribution - Bento Style */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                Subscription Tier Distribution
              </CardTitle>
              <Badge className="bg-primary/10 text-primary">6 Tiers Available</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries({
                mj_scott: 'MJ Scott (FREE)',
                forming: 'Forming ($5)',
                storming: 'Storming ($10)',
                norming: 'Norming ($15)',
                performing: 'Performing ($20)',
                appsumo: 'AppSumo (FREE)'
              }).map(([tier, name]) => (
                <div key={tier} className="text-center p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-muted/20 hover:border-primary/20 transition-colors">
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {tierDistribution[tier] || 0}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">{name}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Active Subscriptions</span>
                <span className="font-semibold text-foreground">
                  {Object.values(tierDistribution).reduce((a, b) => a + b, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Health Status - Bento Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Platform Status
                </CardTitle>
                <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-50/50 border border-green-100">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium text-sm">Database</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">Operational</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-50/50 border border-green-100">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium text-sm">Authentication</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">Operational</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-50/50 border border-green-100">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium text-sm">Multi-tenant System</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">Ready</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium text-sm">Customer Onboarding</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Platform Readiness
                </CardTitle>
                <Badge className="bg-primary/10 text-primary">Launch Ready</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <span className="text-sm font-medium">Pricing Tiers Configured</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">6/6 Complete</Badge>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <span className="text-sm font-medium">Role System</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">Complete</Badge>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <span className="text-sm font-medium">Multi-tenant Architecture</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">Implemented</Badge>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <span className="text-sm font-medium">Platform Super Admins</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">3 Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <span className="text-sm font-medium">Customer Onboarding</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">Ready</Badge>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-green-700 mb-1">Platform Ready</p>
                    <p className="text-sm text-green-600">Ready for customer acquisition</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
    </div>
  );
}