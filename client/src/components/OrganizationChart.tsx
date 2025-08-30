import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Building2 } from 'lucide-react';

interface OrganizationChartProps {
  user: any;
  employees: any[];
  employeesLoading: boolean;
}

export default function OrganizationChart({ user, employees = [], employeesLoading }: OrganizationChartProps) {
  
  // Find tenant admin (acts as CEO/top level)
  const tenantAdmin = employees.find((emp: any) => emp.role === 'tenant_admin');
  
  // Group employees by role type
  const managers = employees.filter((emp: any) => emp.role === 'manager');
  const regularEmployees = employees.filter((emp: any) => emp.role === 'employee');
  
  return (
    <Card className="glass-card border-0" data-testid="card-organization-structure">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Organization Structure</CardTitle>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-view-full-chart">
            View Full Chart
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Level Leadership */}
        {employeesLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          </div>
        ) : tenantAdmin ? (
          <div className="flex items-center justify-center" data-testid="org-ceo-level">
            <div className="text-center">
              <Avatar className="w-16 h-16 mx-auto mb-2 border-4 border-blue-200">
                <AvatarImage 
                  src={tenantAdmin.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tenantAdmin.id}`}
                  alt={`${tenantAdmin.firstName} ${tenantAdmin.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback>
                  {tenantAdmin.firstName?.charAt(0)}{tenantAdmin.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold text-sm" data-testid="text-ceo-name">
                {tenantAdmin.firstName} {tenantAdmin.lastName}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="text-ceo-role">Tenant Admin</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            <Building2 className="w-6 h-6 mr-2" />
            <span className="text-sm">No leadership data available</span>
          </div>
        )}
        
        {/* Show ALL Managers */}
        {employeesLoading ? (
          <div className="flex justify-center space-x-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : managers.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-center text-muted-foreground">Management Team</h3>
            <div className="flex flex-wrap justify-center gap-4" data-testid="org-managers">
              {managers.map((manager: any) => (
                <div key={manager.id} className="text-center" data-testid={`manager-${manager.id}`}>
                  <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-purple-200">
                    <AvatarImage 
                      src={manager.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${manager.id}`}
                      alt={`${manager.firstName} ${manager.lastName}`}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {manager.firstName?.charAt(0)}{manager.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-xs">{manager.firstName} {manager.lastName}</p>
                  <p className="text-xs text-muted-foreground">Manager</p>
                  <p className="text-xs text-muted-foreground">{manager.department?.name || 'Department'}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        
        {/* Show ALL Regular Employees */}
        {employeesLoading ? null : regularEmployees.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-center text-muted-foreground">Team Members</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" data-testid="org-employees">
              {regularEmployees.map((employee: any) => (
                <div key={employee.id} className="text-center" data-testid={`employee-${employee.id}`}>
                  <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-green-200">
                    <AvatarImage 
                      src={employee.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-xs">{employee.firstName} {employee.lastName}</p>
                  <p className="text-xs text-muted-foreground">{employee.jobTitle || 'Employee'}</p>
                  <p className="text-xs text-muted-foreground">{employee.department?.name || 'Department'}</p>
                </div>
              ))}
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">No team structure available</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
