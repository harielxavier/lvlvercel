import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Mail,
  Phone
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface EmployeeManagementProps {
  user: any;
}

export default function EmployeeManagement({ user }: EmployeeManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['/api/employees', user.tenant?.id],
    enabled: !!user.tenant?.id,
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const response = await apiRequest('POST', '/api/employees', employeeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
      setIsAddEmployeeOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    },
  });

  const filteredEmployees = employees?.filter((emp: any) =>
    emp.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="employee-management-container">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="heading-employee-management">Employee Management</h2>
          <p className="text-muted-foreground">Manage your team members and their roles</p>
        </div>
        <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600" data-testid="button-add-employee">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-add-employee">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Create a new employee profile and assign their role in the organization.
              </DialogDescription>
            </DialogHeader>
            {/* Add employee form would go here */}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)} data-testid="button-cancel-add-employee">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Implement actual employee creation
                  toast({
                    title: "Feature Coming Soon",
                    description: "Employee creation form will be implemented",
                  });
                }}
                data-testid="button-save-employee"
              >
                Save Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card border-0" data-testid="card-employee-search">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-employees"
              />
            </div>
            <Button variant="outline" data-testid="button-filter-employees">
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card className="glass-card border-0" data-testid="card-employee-table">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <Badge variant="outline" data-testid="badge-employee-count">
              {employees?.length || 0} employees
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4" data-testid={`skeleton-employee-${i}`}>
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground" data-testid="text-no-employees">
                        No employees found. Add your first team member to get started.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees?.map((employee: any, index: number) => (
                    <TableRow key={employee.id} data-testid={`row-employee-${index}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage 
                              src={employee.user?.profileImageUrl} 
                              alt={`${employee.user?.firstName} ${employee.user?.lastName}`}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {employee.user?.firstName?.[0]}{employee.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium" data-testid={`text-employee-name-${index}`}>
                              {employee.user?.firstName} {employee.user?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center" data-testid={`text-employee-email-${index}`}>
                              <Mail className="w-3 h-3 mr-1" />
                              {employee.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-employee-position-${index}`}>
                        {employee.jobPosition?.title || 'Not Assigned'}
                      </TableCell>
                      <TableCell data-testid={`text-employee-department-${index}`}>
                        {employee.department?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 performance-ring rounded-full flex items-center justify-center">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-primary" data-testid={`text-employee-score-${index}`}>
                                {Math.floor(Math.random() * 30) + 70}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={employee.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                          data-testid={`badge-employee-status-${index}`}
                        >
                          {employee.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" data-testid={`button-employee-actions-${index}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
