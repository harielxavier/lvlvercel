import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import OrganizationChartComponent from '@/components/OrganizationChart';

export default function OrganizationChart() {
  const { user, isLoading, isAuthenticated } = useUserContext();
  const { toast } = useToast();

  // Fetch employees for this tenant
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees', user?.tenant?.id],
    enabled: !!user?.tenant?.id && !!isAuthenticated,
  });

  // Calculate real metrics
  const totalEmployees = employees.length;
  const departmentCount = new Set(employees.map((emp: any) => emp.departmentId).filter(Boolean)).size || 1;
  const managersCount = employees.filter((emp: any) => emp.role === 'manager').length;
  const growthRate = totalEmployees > 0 ? Math.round((managersCount / totalEmployees) * 100) : 0;

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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-org-chart">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-org-chart">
                  Organization Chart
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visualize your company structure and reporting relationships
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                    {employeesLoading ? (
                      <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{totalEmployees}</p>
                    )}
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
                    <p className="text-sm font-medium text-muted-foreground">Departments</p>
                    {employeesLoading ? (
                      <div className="h-9 w-8 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{departmentCount}</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Management Ratio</p>
                    {employeesLoading ? (
                      <div className="h-9 w-12 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{growthRate}%</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Use the working organization chart component */}
          <OrganizationChartComponent user={user} />
        </div>
      </main>
    </div>
  );
}