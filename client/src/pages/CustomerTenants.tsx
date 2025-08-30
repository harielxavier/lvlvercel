import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserContext } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  Copy,
  Edit,
  Trash2,
  LogIn,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Tenant, User } from '@shared/schema';

// Form schemas
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['platform_admin', 'tenant_admin', 'manager', 'employee']),
  tenantId: z.string().optional(),
});

const tenantSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  domain: z.string().min(1, 'Domain is required'),
  subscriptionTier: z.enum(['mj_scott', 'forming', 'storming', 'norming', 'performing', 'appsumo']),
  maxEmployees: z.number().min(-1, 'Max employees must be -1 (unlimited) or positive'),
  isActive: z.boolean(),
});

export default function CustomerTenants() {
  const { user } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  // Modal states
  const [editUserModal, setEditUserModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [createUserModal, setCreateUserModal] = useState(false);
  const [createTenantModal, setCreateTenantModal] = useState(false);
  const [editTenantModal, setEditTenantModal] = useState<{ open: boolean; tenant: Tenant | null }>({ open: false, tenant: null });
  
  const { data: tenants, isLoading, error } = useQuery<Tenant[]>({
    queryKey: ['/api/platform/tenants']
  });

  const { data: users, isLoading: usersLoading } = useQuery<(User & { tenantName?: string | null })[]>({
    queryKey: ['/api/platform/users']
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof userSchema>) => {
      return apiRequest('POST', '/api/platform/users', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/users'] });
      setCreateUserModal(false);
      toast({ title: "User created successfully!" });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast({ 
        title: "Error creating user", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<z.infer<typeof userSchema>> }) => {
      return apiRequest('PATCH', `/api/platform/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/users'] });
      setEditUserModal({ open: false, user: null });
      toast({ title: "User updated successfully!" });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast({ 
        title: "Error updating user", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('DELETE', `/api/platform/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/users'] });
      toast({ title: "User deleted successfully!" });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast({ 
        title: "Error deleting user", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: async (tenantData: z.infer<typeof tenantSchema>) => {
      return apiRequest('POST', '/api/platform/tenants', tenantData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/tenants'] });
      setCreateTenantModal(false);
      toast({ title: "Tenant created successfully!" });
    },
    onError: (error) => {
      console.error('Error creating tenant:', error);
      toast({ 
        title: "Error creating tenant", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<z.infer<typeof tenantSchema>> }) => {
      return apiRequest('PATCH', `/api/platform/tenants/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/tenants'] });
      setEditTenantModal({ open: false, tenant: null });
      toast({ title: "Company updated successfully!" });
    },
    onError: (error) => {
      console.error('Error updating tenant:', error);
      toast({ 
        title: "Error updating company", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      return apiRequest('DELETE', `/api/platform/tenants/${tenantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/platform/users'] });
      toast({ title: "Company deleted successfully!" });
    },
    onError: (error) => {
      console.error('Error deleting tenant:', error);
      toast({ 
        title: "Error deleting company", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const loginAsUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('POST', '/api/platform/login-as-user', { userId });
    },
    onSuccess: () => {
      toast({ title: "Logged in successfully! Redirecting..." });
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: (error) => {
      console.error('Error logging in as user:', error);
      toast({ 
        title: "Error logging in as user", 
        description: error.message, 
        variant: "destructive" 
      });
    },
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

  // Form components
  const EditUserModal = ({ user, open, onClose }: { user: User | null; open: boolean; onClose: () => void }) => {
    const form = useForm<z.infer<typeof userSchema>>({
      resolver: zodResolver(userSchema),
      defaultValues: {
        email: user?.email || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        role: user?.role as any || 'employee',
        tenantId: user?.tenantId || '',
      },
    });

    const onSubmit = (data: z.infer<typeof userSchema>) => {
      if (user) {
        updateUserMutation.mutate({ id: user.id, data });
      }
    };

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="platform_admin">Platform Admin</SelectItem>
                          <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Company (Platform Admin)</SelectItem>
                          {tenants?.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  const CreateUserModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const form = useForm<z.infer<typeof userSchema>>({
      resolver: zodResolver(userSchema),
      defaultValues: {
        email: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        tenantId: '',
      },
    });

    const onSubmit = (data: z.infer<typeof userSchema>) => {
      createUserMutation.mutate(data);
      form.reset();
    };

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="user@company.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="platform_admin">Platform Admin</SelectItem>
                          <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Company (Platform Admin)</SelectItem>
                          {tenants?.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  const CreateTenantModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const form = useForm<z.infer<typeof tenantSchema>>({
      resolver: zodResolver(tenantSchema),
      defaultValues: {
        name: '',
        domain: '',
        subscriptionTier: 'forming',
        maxEmployees: -1,
        isActive: true,
      },
    });

    const onSubmit = (data: z.infer<typeof tenantSchema>) => {
      createTenantMutation.mutate(data);
      form.reset();
    };

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Acme Corporation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="acme.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subscriptionTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Tier</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mj_scott">MJ Scott</SelectItem>
                          <SelectItem value="forming">Forming</SelectItem>
                          <SelectItem value="storming">Storming</SelectItem>
                          <SelectItem value="norming">Norming</SelectItem>
                          <SelectItem value="performing">Performing</SelectItem>
                          <SelectItem value="appsumo">AppSumo</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Employees (-1 for unlimited)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        placeholder="-1" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTenantMutation.isPending}>
                  {createTenantMutation.isPending ? 'Creating...' : 'Create Tenant'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  const EditTenantModal = ({ tenant, open, onClose }: { tenant: Tenant | null; open: boolean; onClose: () => void }) => {
    const form = useForm<z.infer<typeof tenantSchema>>({
      resolver: zodResolver(tenantSchema),
      defaultValues: {
        name: tenant?.name || '',
        domain: tenant?.domain || '',
        subscriptionTier: tenant?.subscriptionTier as any || 'forming',
        maxEmployees: tenant?.maxEmployees || 0,
        isActive: tenant?.isActive ?? true,
      },
    });

    const onSubmit = (data: z.infer<typeof tenantSchema>) => {
      if (tenant) {
        updateTenantMutation.mutate({ id: tenant.id, data });
      }
    };

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subscriptionTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Tier</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mj_scott">MJ Scott</SelectItem>
                          <SelectItem value="forming">Forming</SelectItem>
                          <SelectItem value="storming">Storming</SelectItem>
                          <SelectItem value="norming">Norming</SelectItem>
                          <SelectItem value="performing">Performing</SelectItem>
                          <SelectItem value="appsumo">AppSumo</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Employees (-1 for unlimited)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTenantMutation.isPending}>
                  {updateTenantMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 transition-all duration-300 ease-in-out overflow-auto" data-testid="page-customer-tenants">
      {/* Header */}
      <header className="glass-morphism border-b sticky top-0 z-40 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text" data-testid="heading-customer-tenants">
                Customer Tenants
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-tenants-description">
                Manage all customer organizations and their subscription tiers
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <Button 
                onClick={() => setCreateTenantModal(true)}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto" 
                data-testid="button-add-tenant"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Tenant
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Platform Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 animate-fade-in">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customer Tenants</p>
                  <div className="text-3xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : tenants?.length || 0}
                  </div>
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
                  <div className="text-3xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : tenants?.filter((t: any) => t.isActive).length || 0}
                  </div>
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
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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
                            <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                  <button
                                    onClick={() => copyToClipboard(user.email || '')}
                                    className="flex items-center space-x-2 hover:text-primary transition-colors"
                                    data-testid={`button-copy-email-${user.firstName?.toLowerCase()}`}
                                  >
                                    <Mail className="w-4 h-4" />
                                    <span className="font-mono text-sm break-all">{user.email}</span>
                                    <Copy className="w-3 h-3 opacity-50" />
                                  </button>
                                  <Badge className={getRoleColor(user.role || 'employee')}>
                                    {getRoleDisplayName(user.role || 'employee')}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <Key className="w-3 h-3" />
                                  <span>Vamos!!86</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => loginAsUserMutation.mutate(user.id)}
                                    disabled={loginAsUserMutation.isPending}
                                    data-testid={`button-login-as-${user.firstName?.toLowerCase()}`}
                                  >
                                    <LogIn className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">Login</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditUserModal({ open: true, user })}
                                    data-testid={`button-edit-${user.firstName?.toLowerCase()}`}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700"
                                        data-testid={`button-delete-${user.firstName?.toLowerCase()}`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteUserMutation.mutate(user.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
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
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground mr-3">
                                <Key className="w-3 h-3" />
                                <span>Vamos!!86</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loginAsUserMutation.mutate(user.id)}
                                disabled={loginAsUserMutation.isPending}
                                data-testid={`button-login-as-${user.firstName?.toLowerCase()}`}
                              >
                                <LogIn className="w-3 h-3 mr-1" />
                                Login
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditUserModal({ open: true, user })}
                                data-testid={`button-edit-${user.firstName?.toLowerCase()}`}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700"
                                    data-testid={`button-delete-${user.firstName?.toLowerCase()}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Platform Admin</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUserMutation.mutate(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditTenantModal({ open: true, tenant })}
                        data-testid={`button-edit-tenant-${tenant.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-tenant-${tenant.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Company</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {tenant.name}? This will also delete all associated users and data. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTenantMutation.mutate(tenant.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Company
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
                <Button 
                  onClick={() => setCreateTenantModal(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Customer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <EditUserModal 
        user={editUserModal.user} 
        open={editUserModal.open} 
        onClose={() => setEditUserModal({ open: false, user: null })} 
      />
      <CreateUserModal 
        open={createUserModal} 
        onClose={() => setCreateUserModal(false)} 
      />
      <CreateTenantModal 
        open={createTenantModal} 
        onClose={() => setCreateTenantModal(false)} 
      />
      <EditTenantModal 
        tenant={editTenantModal.tenant} 
        open={editTenantModal.open} 
        onClose={() => setEditTenantModal({ open: false, tenant: null })} 
      />
      </main>
    </div>
  );
}