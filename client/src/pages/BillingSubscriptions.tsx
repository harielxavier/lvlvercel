import { useUserContext } from '@/context/UserContext';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  Calendar,
  Settings,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Tenant } from '@shared/schema';
import { useEffect } from 'react';

interface PlatformMetrics {
  totalTenants: number;
  totalUsers: number;
  totalEmployees: number;
  totalFeedback: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
}

export default function BillingSubscriptions() {
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
  
  const { data: tenants, isLoading: tenantsLoading, error } = useQuery<Tenant[]>({
    queryKey: ['/api/platform/tenants']
  });

  const { data: metrics } = useQuery<PlatformMetrics>({
    queryKey: ['/api/platform/metrics']
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

  function getTierPrice(tier: string) {
    switch (tier) {
      case 'mj_scott': return { monthly: 0, yearly: 0 };
      case 'forming': return { monthly: 5, yearly: 4 };
      case 'storming': return { monthly: 10, yearly: 8 };
      case 'norming': return { monthly: 15, yearly: 12 };
      case 'performing': return { monthly: 20, yearly: 16 };
      case 'appsumo': return { monthly: 0, yearly: 0 };
      default: return { monthly: 0, yearly: 0 };
    }
  }

  function getTierDisplayName(tier: string) {
    switch (tier) {
      case 'mj_scott': return 'MJ Scott (VIP)';
      case 'forming': return 'Forming';
      case 'storming': return 'Storming';
      case 'norming': return 'Norming';
      case 'performing': return 'Performing';
      case 'appsumo': return 'AppSumo (Lifetime)';
      default: return 'Unknown';
    }
  }

  function getTierColor(tier: string) {
    switch (tier) {
      case 'mj_scott': return 'bg-purple-100 text-purple-800';
      case 'forming': return 'bg-blue-100 text-blue-800';
      case 'storming': return 'bg-green-100 text-green-800';
      case 'norming': return 'bg-orange-100 text-orange-800';
      case 'performing': return 'bg-red-100 text-red-800';
      case 'appsumo': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-billing-subscriptions">
      {/* Header */}
      <header className="glass-morphism border-b sticky top-0 z-40">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text" data-testid="heading-billing-subscriptions">
                Billing & Subscriptions
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-billing-description">
                Monitor subscription tiers, revenue, and billing across all customer tenants
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" data-testid="button-export-billing">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card border-0 animate-fade-in" data-testid="card-mrr">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="metric-mrr">
                    ${metrics?.monthlyRecurringRevenue || 0}
                  </p>
                  <p className="text-sm text-primary font-medium mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Ready to scale
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 animate-fade-in" data-testid="card-active-subscriptions">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="metric-active-subs">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.activeSubscriptions || 0}
                  </p>
                  <p className="text-sm text-green-600 font-medium mt-1">Platform ready</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 animate-fade-in" data-testid="card-total-tenants-billing">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customer Tenants</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="metric-tenants-billing">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : tenants?.length || 0}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">Ready for onboarding</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 animate-fade-in" data-testid="card-conversion-rate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold text-foreground">0%</p>
                  <p className="text-sm text-orange-600 font-medium mt-1">Awaiting customers</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Breakdown */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-primary" />
              Subscription Tier Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { tier: 'mj_scott', name: 'MJ Scott', price: 'FREE', target: 'VIP/Special Access' },
                { tier: 'forming', name: 'Forming', price: '$5/mo', target: 'Startups (1-25)' },
                { tier: 'storming', name: 'Storming', price: '$10/mo', target: 'Growing (25-100)' },
                { tier: 'norming', name: 'Norming', price: '$15/mo', target: 'Established (100-500)' },
                { tier: 'performing', name: 'Performing', price: '$20/mo', target: 'Enterprise (500+)' },
                { tier: 'appsumo', name: 'AppSumo', price: 'FREE', target: 'Lifetime Deal' }
              ].map((tierInfo) => {
                const tenantCount = tenants?.filter((t) => t.subscriptionTier === tierInfo.tier).length || 0;
                return (
                  <div key={tierInfo.tier} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{tierInfo.name}</h3>
                      <Badge className={getTierColor(tierInfo.tier)}>
                        {tierInfo.price}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{tierInfo.target}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{tenantCount}</span>
                      <span className="text-xs text-muted-foreground">customers</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tenant Billing Details */}
        {tenants && tenants.length > 0 && (
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Customer Billing Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{tenant.name}</h3>
                        <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getTierColor(tenant.subscriptionTier || 'forming')}>
                        {getTierDisplayName(tenant.subscriptionTier || 'forming')}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">
                          ${getTierPrice(tenant.subscriptionTier || 'forming').monthly}/mo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${getTierPrice(tenant.subscriptionTier || 'forming').yearly}/mo (yearly)
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </main>
    </div>
  );
}