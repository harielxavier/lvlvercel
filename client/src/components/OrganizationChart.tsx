import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2 } from 'lucide-react';

interface OrganizationChartProps {
  user: any;
}

export default function OrganizationChart({ user }: OrganizationChartProps) {
  // Get employees for the organization chart
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees', user.tenant?.id],
    enabled: !!user.tenant?.id,
  });
  
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
        
        {/* Real Team Structure */}
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
        ) : employees.length > 0 ? (
          <div className="flex justify-center space-x-8" data-testid="org-department-heads">
            <div className="text-center" data-testid="department-management">
              <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-purple-200">
                {managers[0] ? (
                  <>
                    <AvatarImage 
                      src={managers[0].profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${managers[0].id}`}
                      alt={`${managers[0].firstName} ${managers[0].lastName}`}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {managers[0].firstName?.charAt(0)}{managers[0].lastName?.charAt(0)}
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback>MG</AvatarFallback>
                )}
              </Avatar>
              <p className="font-medium text-xs">Management</p>
              <p className="text-xs text-muted-foreground">{managers.length} managers</p>
            </div>
            
            <div className="text-center" data-testid="department-team">
              <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-green-200">
                {regularEmployees[0] ? (
                  <>
                    <AvatarImage 
                      src={regularEmployees[0].profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${regularEmployees[0].id}`}
                      alt={`${regularEmployees[0].firstName} ${regularEmployees[0].lastName}`}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {regularEmployees[0].firstName?.charAt(0)}{regularEmployees[0].lastName?.charAt(0)}
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback>TM</AvatarFallback>
                )}
              </Avatar>
              <p className="font-medium text-xs">Team Members</p>
              <p className="text-xs text-muted-foreground">{regularEmployees.length} employees</p>
            </div>
            
            <div className="text-center" data-testid="department-total">
              <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-blue-200">
                <AvatarFallback><Users className="w-6 h-6" /></AvatarFallback>
              </Avatar>
              <p className="font-medium text-xs">Total Team</p>
              <p className="text-xs text-muted-foreground">{employees.length} people</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">No team structure available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
