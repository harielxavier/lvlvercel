import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Search, Filter, UserPlus, Target, Star, TrendingUp, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';

export default function EmployeeManagement() {
  const { user, isLoading, isAuthenticated } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      if (!response.ok) throw new Error('Failed to add employee');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: 'Employee Added',
        description: 'New employee has been successfully added with a unique feedback URL.',
      });
      setIsAddDialogOpen(false);
      setNewEmployee({ firstName: '', lastName: '', email: '' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add employee',
        variant: 'destructive'
      });
    }
  });
  
  const handleAddEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    addEmployeeMutation.mutate({
      ...newEmployee,
      tenantId: user.tenant?.id
    });
  };
  
  // Get employees for current tenant
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees', user?.tenantId],
    enabled: !!user?.tenantId,
    retry: false,
  });

  const copyFeedbackUrl = (feedbackUrl: string) => {
    const fullUrl = `${window.location.origin}/feedback/${feedbackUrl}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: 'Link Copied!',
      description: 'Feedback URL copied to clipboard',
    });
  };

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

  // Calculate real employee metrics
  const employeesArray = Array.isArray(employees) ? employees : [];
  const totalEmployees = employeesArray.length;
  // Check if user can add employees (only tenant_admin and manager)
  const canAddEmployees = user?.role === 'tenant_admin' || user?.role === 'manager';
  
  const activeEmployees = employeesArray.filter((emp: any) => emp.status === 'active').length;
  const newHires = employeesArray.filter((emp: any) => {
    const hireDate = new Date(emp.hireDate);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return hireDate > thirtyDaysAgo;
  }).length;
  const employeesWithFeedbackUrls = employeesArray.filter((emp: any) => emp.feedbackUrl).length;

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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-employee-management">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-employee-management">
                  Employee Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage team performance and feedback systems
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    {canAddEmployees && (
                      <Button className="bg-primary hover:bg-primary/90" data-testid="button-add-employee">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Employee
                      </Button>
                    )}
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={newEmployee.firstName}
                          onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                          placeholder="Enter first name"
                          data-testid="input-employee-firstname"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={newEmployee.lastName}
                          onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                          placeholder="Enter last name"
                          data-testid="input-employee-lastname"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                          placeholder="Enter email address"
                          data-testid="input-employee-email"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAddDialogOpen(false)}
                          data-testid="button-cancel-employee"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddEmployee}
                          disabled={addEmployeeMutation.isPending}
                          data-testid="button-save-employee"
                        >
                          {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                    <p className="text-3xl font-bold text-foreground">
                      {employeesLoading ? '...' : totalEmployees}
                    </p>
                    <p className="text-sm text-muted-foreground">Performance tracking active</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Active Employees</p>
                    <p className="text-3xl font-bold text-green-600">
                      {employeesLoading ? '...' : activeEmployees}
                    </p>
                    <p className="text-sm text-green-600">Ready for feedback</p>
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
                    <p className="text-sm font-medium text-muted-foreground">With Feedback URLs</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {employeesLoading ? '...' : employeesWithFeedbackUrls}
                    </p>
                    <p className="text-sm text-purple-600">Universal links ready</p>
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
                    <p className="text-sm font-medium text-muted-foreground">New Hires (30d)</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {employeesLoading ? '...' : newHires}
                    </p>
                    <p className="text-sm text-orange-600">Recent additions</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Performance Team Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {employeesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : employeesArray.length > 0 ? (
                <div className="space-y-4">
                  {employeesArray.map((employee: any) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`} />
                          <AvatarFallback>
                            {employee.firstName && employee.lastName 
                              ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase()
                              : employee.userId?.substring(0, 2).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.firstName && employee.lastName ? `${employee.firstName} ${employee.lastName}` : `Employee ${employee.employeeNumber || employee.id.substring(0, 8)}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.status === 'active' ? 'Active' : employee.status || 'Unknown Status'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Feedback URL</p>
                          <p className="text-xs text-muted-foreground">
                            {employee.feedbackUrl ? 'Ready to share' : 'Not generated'}
                          </p>
                        </div>
                        {employee.feedbackUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyFeedbackUrl(employee.feedbackUrl)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                        )}
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status === 'active' ? 'Active' : employee.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Employees Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Add employees to start tracking performance and collecting feedback.
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Employee
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}