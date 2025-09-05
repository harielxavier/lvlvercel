import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, Plus, Search, Filter, UserPlus, Building2, Briefcase, 
  ChevronDown, MoreHorizontal, Edit, Trash2, UserCheck, Users2,
  MapPin, Star, Calendar, Phone, Mail, Globe, Settings
} from 'lucide-react';

interface Employee {
  id: string;
  userId: string;
  tenantId: string;
  employeeNumber?: string;
  jobPositionId?: string;
  departmentId?: string;
  managerId?: string;
  feedbackUrl: string;
  hireDate?: string;
  status: string;
  bio?: string;
  skills?: string[];
  workLocation?: string;
  emergencyContact?: any;
  personalGoals?: string;
  achievements?: any;
  salaryGrade?: string;
  performanceRating?: number;
  tags?: string[];
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImageUrl?: string;
  phoneNumber?: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
}

interface JobPosition {
  id: string;
  title: string;
  department?: string;
  level?: number;
  description?: string;
}

interface AdvancedEmployeeManagementProps {
  user: any;
}

export default function AdvancedEmployeeManagement({ user }: AdvancedEmployeeManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
  const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);
  const [isCreateJobPositionOpen, setIsCreateJobPositionOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');

  // Fetch data
  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees', user?.tenantId],
    enabled: !!user?.tenantId,
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments', user?.tenantId],
    enabled: !!user?.tenantId,
  });

  const { data: jobPositions = [] } = useQuery<JobPosition[]>({
    queryKey: ['/api/job-positions', user?.tenantId],
    enabled: !!user?.tenantId,
  });

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !searchQuery || 
      emp.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || emp.departmentId === selectedDepartment;
    const matchesStatus = !selectedStatus || emp.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/employees', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: 'Success', description: 'Employee created successfully!' });
      setIsCreateEmployeeOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create employee',
        variant: 'destructive' 
      });
    }
  });

  // Create department mutation
  const createDepartmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/departments', { ...data, tenantId: user.tenantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({ title: 'Success', description: 'Department created successfully!' });
      setIsCreateDepartmentOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create department',
        variant: 'destructive' 
      });
    }
  });

  // Create job position mutation
  const createJobPositionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/job-positions', { ...data, tenantId: user.tenantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-positions'] });
      toast({ title: 'Success', description: 'Job position created successfully!' });
      setIsCreateJobPositionOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create job position',
        variant: 'destructive' 
      });
    }
  });

  // Bulk operations mutation
  const bulkAssignMutation = useMutation({
    mutationFn: async ({ type, value }: { type: 'department' | 'manager'; value: string }) => {
      const endpoint = type === 'department' 
        ? '/api/employees/bulk-assign-department' 
        : '/api/employees/bulk-assign-manager';
      return apiRequest('POST', endpoint, { 
        employeeIds: selectedEmployees, 
        [type + 'Id']: value 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: 'Success', description: 'Bulk operation completed successfully!' });
      setSelectedEmployees([]);
      setIsBulkActionsOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Bulk operation failed',
        variant: 'destructive' 
      });
    }
  });

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'Unassigned';
    return departments.find(dept => dept.id === departmentId)?.name || 'Unknown';
  };

  const getJobPositionTitle = (jobPositionId?: string) => {
    if (!jobPositionId) return 'Unassigned';
    return jobPositions.find(pos => pos.id === jobPositionId)?.title || 'Unknown';
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'No Manager';
    const manager = employees.find(emp => emp.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Advanced Employee Management</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive employee, department, and organizational management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateDepartmentOpen} onOpenChange={setIsCreateDepartmentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-department">
                <Building2 className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Department</DialogTitle>
              </DialogHeader>
              <CreateDepartmentForm 
                departments={departments}
                onSubmit={(data: any) => createDepartmentMutation.mutate(data)}
                isLoading={createDepartmentMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateJobPositionOpen} onOpenChange={setIsCreateJobPositionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-job-position">
                <Briefcase className="w-4 h-4 mr-2" />
                Add Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Job Position</DialogTitle>
              </DialogHeader>
              <CreateJobPositionForm 
                onSubmit={(data: any) => createJobPositionMutation.mutate(data)}
                isLoading={createJobPositionMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateEmployeeOpen} onOpenChange={setIsCreateEmployeeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-employee">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Employee</DialogTitle>
              </DialogHeader>
              <CreateEmployeeForm 
                departments={departments}
                jobPositions={jobPositions}
                employees={employees}
                onSubmit={(data: any) => createEmployeeMutation.mutate({ ...data, tenantId: user.tenantId })}
                isLoading={createEmployeeMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search employees by name, email, or employee number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-employees"
                />
              </div>
            </div>
            
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]" data-testid="select-department-filter">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>

            {selectedEmployees.length > 0 && (
              <Dialog open={isBulkActionsOpen} onOpenChange={setIsBulkActionsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-bulk-actions">
                    <Users2 className="w-4 h-4 mr-2" />
                    Bulk Actions ({selectedEmployees.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Operations</DialogTitle>
                  </DialogHeader>
                  <BulkActionsForm 
                    departments={departments}
                    employees={employees}
                    selectedCount={selectedEmployees.length}
                    onSubmit={(data: any) => bulkAssignMutation.mutate(data)}
                    isLoading={bulkAssignMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees" data-testid="tab-employees">Employees ({filteredEmployees.length})</TabsTrigger>
          <TabsTrigger value="departments" data-testid="tab-departments">Departments ({departments.length})</TabsTrigger>
          <TabsTrigger value="positions" data-testid="tab-positions">Positions ({jobPositions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          {employeesLoading ? (
            <EmployeeSkeletonLoader />
          ) : (
            <EmployeeGrid 
              employees={filteredEmployees}
              selectedEmployees={selectedEmployees}
              onSelectEmployee={handleSelectEmployee}
              onSelectAll={handleSelectAll}
              getDepartmentName={getDepartmentName}
              getJobPositionTitle={getJobPositionTitle}
              getManagerName={getManagerName}
            />
          )}
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <DepartmentGrid departments={departments} employees={employees} />
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <JobPositionGrid jobPositions={jobPositions} employees={employees} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components for different forms and views
function CreateEmployeeForm({ 
  departments, 
  jobPositions, 
  employees, 
  onSubmit, 
  isLoading 
}: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    employeeNumber: '',
    departmentId: '',
    jobPositionId: '',
    managerId: '',
    workLocation: 'office',
    bio: '',
    skills: '',
    personalGoals: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
            data-testid="input-employee-first-name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
            data-testid="input-employee-last-name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            data-testid="input-employee-email"
          />
        </div>
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            data-testid="input-employee-phone"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employeeNumber">Employee Number</Label>
          <Input
            id="employeeNumber"
            value={formData.employeeNumber}
            onChange={(e) => setFormData({...formData, employeeNumber: e.target.value})}
            data-testid="input-employee-number"
          />
        </div>
        <div>
          <Label htmlFor="workLocation">Work Location</Label>
          <Select value={formData.workLocation} onValueChange={(value) => setFormData({...formData, workLocation: value})}>
            <SelectTrigger data-testid="select-work-location">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="departmentId">Department</Label>
          <Select value={formData.departmentId} onValueChange={(value) => setFormData({...formData, departmentId: value})}>
            <SelectTrigger data-testid="select-employee-department">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept: Department) => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="jobPositionId">Job Position</Label>
          <Select value={formData.jobPositionId} onValueChange={(value) => setFormData({...formData, jobPositionId: value})}>
            <SelectTrigger data-testid="select-employee-position">
              <SelectValue placeholder="Select Position" />
            </SelectTrigger>
            <SelectContent>
              {jobPositions.map((pos: JobPosition) => (
                <SelectItem key={pos.id} value={pos.id}>{pos.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="managerId">Manager</Label>
        <Select value={formData.managerId} onValueChange={(value) => setFormData({...formData, managerId: value})}>
          <SelectTrigger data-testid="select-employee-manager">
            <SelectValue placeholder="Select Manager" />
          </SelectTrigger>
          <SelectContent>
            {employees.filter((emp: Employee) => emp.role === 'manager' || emp.role === 'tenant_admin').map((emp: Employee) => (
              <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          placeholder="Brief description of the employee..."
          data-testid="textarea-employee-bio"
        />
      </div>

      <div>
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input
          id="skills"
          value={formData.skills}
          onChange={(e) => setFormData({...formData, skills: e.target.value})}
          placeholder="JavaScript, Project Management, Design..."
          data-testid="input-employee-skills"
        />
      </div>

      <div>
        <Label htmlFor="personalGoals">Personal Goals</Label>
        <Textarea
          id="personalGoals"
          value={formData.personalGoals}
          onChange={(e) => setFormData({...formData, personalGoals: e.target.value})}
          placeholder="Professional development goals and aspirations..."
          data-testid="textarea-employee-goals"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isLoading} data-testid="button-submit-employee">
          {isLoading ? 'Creating...' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
}

function CreateDepartmentForm({ departments, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentDepartmentId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Department Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          data-testid="input-department-name"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Brief description of the department..."
          data-testid="textarea-department-description"
        />
      </div>

      <div>
        <Label htmlFor="parentDepartmentId">Parent Department</Label>
        <Select value={formData.parentDepartmentId} onValueChange={(value) => setFormData({...formData, parentDepartmentId: value})}>
          <SelectTrigger data-testid="select-parent-department">
            <SelectValue placeholder="Select Parent Department (Optional)" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept: Department) => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isLoading} data-testid="button-submit-department">
          {isLoading ? 'Creating...' : 'Create Department'}
        </Button>
      </div>
    </form>
  );
}

function CreateJobPositionForm({ onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    level: 1,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Position Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
          data-testid="input-position-title"
        />
      </div>

      <div>
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData({...formData, department: e.target.value})}
          data-testid="input-position-department"
        />
      </div>

      <div>
        <Label htmlFor="level">Level (1-10)</Label>
        <Input
          id="level"
          type="number"
          min="1"
          max="10"
          value={formData.level}
          onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
          data-testid="input-position-level"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Job responsibilities and requirements..."
          data-testid="textarea-position-description"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isLoading} data-testid="button-submit-position">
          {isLoading ? 'Creating...' : 'Create Position'}
        </Button>
      </div>
    </form>
  );
}

function BulkActionsForm({ departments, employees, selectedCount, onSubmit, isLoading }: any) {
  const [action, setAction] = useState<'department' | 'manager'>('department');
  const [targetValue, setTargetValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetValue) {
      onSubmit({ type: action, value: targetValue });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Performing bulk operation on {selectedCount} selected employees
        </p>
      </div>

      <div>
        <Label>Action Type</Label>
        <Select value={action} onValueChange={(value: 'department' | 'manager') => setAction(value)}>
          <SelectTrigger data-testid="select-bulk-action-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="department">Assign Department</SelectItem>
            <SelectItem value="manager">Assign Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>
          {action === 'department' ? 'Select Department' : 'Select Manager'}
        </Label>
        <Select value={targetValue} onValueChange={setTargetValue}>
          <SelectTrigger data-testid="select-bulk-target">
            <SelectValue placeholder={`Select ${action === 'department' ? 'Department' : 'Manager'}`} />
          </SelectTrigger>
          <SelectContent>
            {action === 'department' 
              ? departments.map((dept: Department) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))
              : employees.filter((emp: Employee) => emp.role === 'manager' || emp.role === 'tenant_admin').map((emp: Employee) => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                ))
            }
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={!targetValue || isLoading} data-testid="button-submit-bulk-action">
          {isLoading ? 'Processing...' : `Update ${selectedCount} Employees`}
        </Button>
      </div>
    </form>
  );
}

function EmployeeGrid({ 
  employees, 
  selectedEmployees, 
  onSelectEmployee, 
  onSelectAll, 
  getDepartmentName, 
  getJobPositionTitle, 
  getManagerName 
}: any) {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Employee Directory</CardTitle>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedEmployees.length === employees.length && employees.length > 0}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="rounded"
              data-testid="checkbox-select-all"
            />
            <Label className="text-sm">Select All</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee: Employee) => (
            <div 
              key={employee.id} 
              className={`relative p-6 rounded-lg border transition-all hover:shadow-md ${
                selectedEmployees.includes(employee.id) 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                  : 'bg-background border-border'
              }`}
              data-testid={`employee-card-${employee.id}`}
            >
              <div className="absolute top-4 right-4">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={(e) => onSelectEmployee(employee.id, e.target.checked)}
                  className="rounded"
                  data-testid={`checkbox-employee-${employee.id}`}
                />
              </div>

              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={employee.profileImageUrl} />
                  <AvatarFallback>
                    {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate" data-testid={`employee-name-${employee.id}`}>
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{employee.email}</p>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm">
                      <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{getDepartmentName(employee.departmentId)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{getJobPositionTitle(employee.jobPositionId)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{getManagerName(employee.managerId)}</span>
                    </div>

                    {employee.workLocation && (
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="capitalize">{employee.workLocation}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge 
                      variant={employee.status === 'active' ? 'default' : 'secondary'}
                      data-testid={`employee-status-${employee.id}`}
                    >
                      {employee.status}
                    </Badge>
                    
                    {employee.performanceRating && (
                      <div className="flex items-center text-sm">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        <span>{employee.performanceRating}</span>
                      </div>
                    )}
                  </div>

                  {employee.skills && employee.skills.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {employee.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {employee.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{employee.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DepartmentGrid({ departments, employees }: any) {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle>Departments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department: Department) => {
            const deptEmployees = employees.filter((emp: Employee) => emp.departmentId === department.id);
            return (
              <div key={department.id} className="p-6 rounded-lg border bg-background" data-testid={`department-card-${department.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{department.name}</h3>
                    {department.description && (
                      <p className="text-sm text-muted-foreground mt-1">{department.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{deptEmployees.length} employees</span>
                  </div>
                  <Badge variant="outline">{deptEmployees.length > 10 ? 'Large' : deptEmployees.length > 5 ? 'Medium' : 'Small'}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function JobPositionGrid({ jobPositions, employees }: any) {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle>Job Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobPositions.map((position: JobPosition) => {
            const posEmployees = employees.filter((emp: Employee) => emp.jobPositionId === position.id);
            return (
              <div key={position.id} className="p-6 rounded-lg border bg-background" data-testid={`position-card-${position.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{position.title}</h3>
                    {position.department && (
                      <p className="text-sm text-muted-foreground">{position.department}</p>
                    )}
                    {position.description && (
                      <p className="text-sm text-muted-foreground mt-1">{position.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{posEmployees.length} employees</span>
                  </div>
                  {position.level && (
                    <Badge variant="outline">Level {position.level}</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function EmployeeSkeletonLoader() {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle>Loading Employees...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-6 rounded-lg border bg-background animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}