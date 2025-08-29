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
  Crown,
  Mail,
  Key,
  UserCheck,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Tenant, User } from '@shared/schema';

export default function CustomerTenants() {
  const { toast } = useToast();
  
  const { data: tenants, isLoading, error } = useQuery<Tenant[]>({
    queryKey: ['/api/platform/tenants']
  });

  const { data: users, isLoading: usersLoading } = useQuery<(User & { tenantName?: string | null })[]>({
    queryKey: ['/api/platform/users']
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Email copied to clipboard",
    });
  };

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

  function getRoleColor(role: string) {
    switch (role) {
      case 'platform_admin': return 'bg-purple-100 text-purple-800';
      case 'tenant_admin': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'employee': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getRoleDisplayName(role: string) {
    switch (role) {
      case 'platform_admin': return 'Platform Admin';
      case 'tenant_admin': return 'Tenant Admin';
      case 'manager': return 'Manager';
      case 'employee': return 'Employee';
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

        {/* Testing Users Section */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-green-600" />
              Testing Users Database
              <Badge className="ml-2 bg-green-100 text-green-800">Password: Vamos!!86</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Click any email to copy it for testing. All users need to create Replit accounts first.
            </p>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-6 w-48 mb-3" />
                    <div className="grid gap-3">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="flex items-center space-x-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-6">
                {tenants?.map((tenant) => {
                  const tenantUsers = users.filter(user => user.tenantId === tenant.id);
                  if (tenantUsers.length === 0) return null;
                  
                  return (
                    <div key={tenant.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{tenant.name}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getTierColor(tenant.subscriptionTier || 'forming')}>
                                {getTierDisplayName(tenant.subscriptionTier || 'forming')}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {tenantUsers.length} users
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        {tenantUsers
                          .sort((a, b) => {
                            const roleOrder = { 'tenant_admin': 0, 'manager': 1, 'employee': 2 };
                            return (roleOrder[a.role as keyof typeof roleOrder] || 3) - (roleOrder[b.role as keyof typeof roleOrder] || 3);
                          })
                          .map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => copyToClipboard(user.email || '')}
                                    className="flex items-center space-x-2 hover:text-primary transition-colors"
                                    data-testid={`button-copy-email-${user.firstName?.toLowerCase()}`}
                                  >
                                    <Mail className="w-4 h-4" />
                                    <span className="font-mono text-sm">{user.email}</span>
                                    <Copy className="w-3 h-3 opacity-50" />
                                  </button>
                                  <Badge className={getRoleColor(user.role || 'employee')}>
                                    {getRoleDisplayName(user.role || 'employee')}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Key className="w-3 h-3" />
                                <span>Vamos!!86</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Platform Super Admins */}
                {users.filter(user => user.role === 'platform_admin').length > 0 && (
                  <div className="border rounded-lg p-4 bg-purple-50/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Crown className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Platform Super Admins</h3>
                        <p className="text-sm text-muted-foreground">Platform-level users (no tenant)</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      {users
                        .filter(user => user.role === 'platform_admin')
                        .map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-purple-100/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                                <Crown className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => copyToClipboard(user.email || '')}
                                  className="flex items-center space-x-2 hover:text-purple-600 transition-colors"
                                  data-testid={`button-copy-email-${user.firstName?.toLowerCase()}`}
                                >
                                  <Mail className="w-4 h-4" />
                                  <span className="font-mono text-sm">{user.email}</span>
                                  <Copy className="w-3 h-3 opacity-50" />
                                </button>
                                <Badge className="bg-purple-100 text-purple-800">
                                  Platform Admin
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Key className="w-3 h-3" />
                              <span>Vamos!!86</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Users Found</h3>
                <p className="text-muted-foreground">No test users have been created yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

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
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{tenant.name}</h3>
                        <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge className={getTierColor(tenant.subscriptionTier || 'forming')}>
                            {getTierDisplayName(tenant.subscriptionTier || 'forming')}
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