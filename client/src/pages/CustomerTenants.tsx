import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Users,
  Calendar,
  Plus,
  Settings,
  Eye,
  TrendingUp,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function CustomerTenants() {
  const { toast } = useToast();
  
  const { data: tenants, isLoading, error } = useQuery({
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

  function getTierDisplayName(tier: string) {
    switch (tier) {
      case 'mj_scott': return 'MJ Scott';
      case 'forming': return 'Forming';
      case 'storming': return 'Storming';
      case 'norming': return 'Norming';
      case 'performing': return 'Performing';
      case 'appsumo': return 'AppSumo';
      default: return 'Unknown';
    }
  }

  return (
    <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-customer-tenants">
      {/* Header */}
      <header className="glass-morphism border-b sticky top-0 z-40">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text" data-testid="heading-customer-tenants">
                Customer Tenants
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-tenants-description">
                Manage all customer organizations and their subscription tiers
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-add-tenant">
                <Plus className="w-4 h-4 mr-2" />
                Add New Tenant
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Platform Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customer Tenants</p>
                  <p className="text-3xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : tenants?.length || 0}
                  </p>
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

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                  <p className="text-3xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : tenants?.filter((t: any) => t.isActive).length || 0}
                  </p>
                  <p className="text-sm text-green-600 font-medium mt-1">All systems operational</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
                  <p className="text-3xl font-bold text-foreground">$0</p>
                  <p className="text-sm text-muted-foreground mt-1">Ready to scale</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Tenants List */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-primary" />
              Customer Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : tenants && tenants.length > 0 ? (
              <div className="space-y-4">
                {tenants.map((tenant: any) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{tenant.name}</h3>
                        <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge className={getTierColor(tenant.subscriptionTier)}>
                            {getTierDisplayName(tenant.subscriptionTier)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Max: {tenant.maxEmployees === -1 ? 'Unlimited' : tenant.maxEmployees} employees
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Customer Tenants Yet</h3>
                <p className="text-muted-foreground mb-4">
                  The platform is ready for customer onboarding. Start by adding your first customer organization.
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Customer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}