import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Search, Filter, Building2, Briefcase, 
  Mail, Phone, MapPin, Star, ArrowLeft
} from 'lucide-react';

// Mock demo data
const demoEmployees = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    role: 'manager',
    department: 'Engineering',
    jobTitle: 'Senior Software Engineer',
    status: 'active',
    phoneNumber: '+1 (555) 123-4567',
    workLocation: 'San Francisco, CA',
    performanceRating: 4.8,
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@company.com',
    role: 'employee',
    department: 'Engineering',
    jobTitle: 'Frontend Developer',
    status: 'active',
    phoneNumber: '+1 (555) 234-5678',
    workLocation: 'Remote',
    performanceRating: 4.6,
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@company.com',
    role: 'tenant_admin',
    department: 'HR',
    jobTitle: 'HR Director',
    status: 'active',
    phoneNumber: '+1 (555) 345-6789',
    workLocation: 'New York, NY',
    performanceRating: 4.9,
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@company.com',
    role: 'manager',
    department: 'Sales',
    jobTitle: 'Sales Manager',
    status: 'active',
    phoneNumber: '+1 (555) 456-7890',
    workLocation: 'Austin, TX',
    performanceRating: 4.7,
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Wang',
    email: 'lisa.wang@company.com',
    role: 'employee',
    department: 'Marketing',
    jobTitle: 'Content Specialist',
    status: 'active',
    phoneNumber: '+1 (555) 567-8901',
    workLocation: 'Seattle, WA',
    performanceRating: 4.5,
    profileImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '6',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@company.com',
    role: 'employee',
    department: 'Engineering',
    jobTitle: 'Backend Developer',
    status: 'active',
    phoneNumber: '+1 (555) 678-9012',
    workLocation: 'Boston, MA',
    performanceRating: 4.4,
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  }
];

const departments = ['Engineering', 'HR', 'Sales', 'Marketing'];
const statuses = ['active', 'inactive', 'pending'];

export default function TrialDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Filter employees based on search criteria
  const filteredEmployees = demoEmployees.filter(emp => {
    const matchesSearch = !searchQuery || 
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || emp.department === selectedDepartment;
    const matchesStatus = !selectedStatus || emp.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      'tenant_admin': 'bg-red-100 text-red-800',
      'manager': 'bg-green-100 text-green-800', 
      'employee': 'bg-blue-100 text-blue-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-morphism border-b sticky top-0 z-40">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="flex items-center"
                data-testid="button-back-to-landing"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Landing
              </Button>
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-trial-demo">
                  Employee Management - Demo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Experience LVL UP Performance with sample data
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Trial Mode
              </Badge>
              <Button onClick={() => window.location.href = '/api/login'}>
                Get Full Access
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demoEmployees.length}</div>
              <p className="text-xs text-muted-foreground">Active workforce</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">Across organization</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.7</div>
              <p className="text-xs text-muted-foreground">Out of 5.0</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remote Workers</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">17%</div>
              <p className="text-xs text-muted-foreground">Work remotely</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-employees"
                  />
                </div>
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                data-testid="select-department"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                data-testid="select-status"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="glass-card hover:shadow-lg transition-shadow" data-testid={`employee-card-${employee.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={employee.profileImageUrl} alt={`${employee.firstName} ${employee.lastName}`} />
                    <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <Badge className={getRoleBadgeColor(employee.role)}>
                        {formatRole(employee.role)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{employee.jobTitle}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Building2 className="h-3 w-3 mr-2" />
                        {employee.department}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-3 w-3 mr-2" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-3 w-3 mr-2" />
                        {employee.phoneNumber}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-2" />
                        {employee.workLocation}
                      </div>
                      <div className="flex items-center text-sm">
                        <Star className="h-3 w-3 mr-2 text-yellow-500" />
                        <span className="font-medium">{employee.performanceRating}/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Call to Action */}
        <Card className="glass-card mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to manage your real team?</h2>
            <p className="text-gray-600 mb-6">
              This is just a demo with sample data. Get full access to manage your actual employees, 
              set up performance reviews, collect feedback, and unlock all premium features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/api/login'}>
                Start Your Free Trial
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = '/'}>
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}