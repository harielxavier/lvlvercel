import { useUserContext } from '@/context/UserContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Brain, Star, TrendingUp, Users, Target, Award, Zap, AlertTriangle, Crown, Lightbulb, Eye, Lock } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function AIInsights() {
  const { user, isLoading, isAuthenticated } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [analyzingEmployee, setAnalyzingEmployee] = useState<string | null>(null);

  // Check if user has AI access (premium tiers)
  const hasAIAccess = user?.employee?.tenant?.subscriptionTier && 
    ['norming', 'performing', 'appsumo'].includes(user.employee.tenant.subscriptionTier.toLowerCase());

  // Get rising star candidates
  const { data: risingStars = [], isLoading: risingStarsLoading } = useQuery({
    queryKey: ['/api/ai/rising-stars'],
    enabled: !!user?.employee?.tenantId && isAuthenticated && hasAIAccess,
  });

  // Get employees for analysis
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees', user?.employee?.tenantId],
    enabled: !!user?.employee?.tenantId && isAuthenticated,
  });

  // Analyze employee mutation
  const analyzeEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      return await apiRequest('POST', `/api/ai/analyze-employee/${employeeId}`, {});
    },
    onSuccess: (data, employeeId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/rising-stars'] });
      toast({
        title: 'Analysis Complete',
        description: 'Behavioral intelligence analysis completed successfully.',
      });
      setAnalyzingEmployee(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze employee behavior',
        variant: 'destructive'
      });
      setAnalyzingEmployee(null);
    }
  });

  const handleAnalyzeEmployee = (employeeId: string) => {
    setAnalyzingEmployee(employeeId);
    analyzeEmployeeMutation.mutate(employeeId);
  };

  if (!isAuthenticated || isLoading) {
    return <div>Loading...</div>;
  }

  if (!hasAIAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="glass-card border-0">
            <CardContent className="p-12">
              <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-4">AI Behavioral Intelligence</h2>
              <p className="text-muted-foreground mb-6">
                Advanced AI-powered behavioral analysis is available for Norming, Performing, and AppSumo subscription tiers.
              </p>
              <div className="space-y-3 text-left bg-muted/20 p-4 rounded-lg mb-6">
                <h3 className="font-semibold flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-blue-600" />
                  Premium AI Features Include:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Rising Star Detection & Leadership Pipeline</li>
                  <li>• Collaboration Impact Scoring</li>
                  <li>• Emotional Intelligence Analysis</li>
                  <li>• Initiative Recognition Engine</li>
                  <li>• Cross-Department Bridge Scoring</li>
                  <li>• Behavioral Pattern Recognition</li>
                </ul>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-600" />
            AI Behavioral Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced behavioral analysis powered by Claude AI to identify rising stars and collaboration patterns
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
          <Crown className="w-3 h-3 mr-1" />
          Premium Feature
        </Badge>
      </div>

      {/* Rising Stars Section */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Rising Star Candidates
            <Badge className="ml-2 bg-yellow-100 text-yellow-700">
              {risingStars.length} Identified
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {risingStarsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : risingStars.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rising star candidates identified yet</p>
              <p className="text-sm">Run behavioral analysis on employees to identify potential leaders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {risingStars.map((star: any) => (
                <Card key={star.id} className="border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">
                          {star.employee?.firstName} {star.employee?.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{star.employee?.jobTitle}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700">
                        {star.overallScore}/100
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Leadership Readiness</span>
                          <span>{star.leadershipReadiness}%</span>
                        </div>
                        <Progress value={star.leadershipReadiness} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Collaboration Score</span>
                          <span>{star.collaborationScore}%</span>
                        </div>
                        <Progress value={star.collaborationScore} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Initiative Score</span>
                          <span>{star.initiativeScore}%</span>
                        </div>
                        <Progress value={star.initiativeScore} className="h-2" />
                      </div>
                    </div>
                    
                    {star.recommendedActions && star.recommendedActions.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-xs font-semibold text-blue-700 mb-2">Recommended Actions:</h4>
                        <ul className="text-xs text-blue-600 space-y-1">
                          {star.recommendedActions.slice(0, 2).map((action: string, index: number) => (
                            <li key={index}>• {action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Analysis Section */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            Run Behavioral Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Analyze individual employees to identify collaboration patterns, leadership potential, and behavioral insights.
          </p>
          
          {employeesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3 mb-3"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee: any) => (
                <Card key={employee.id} className="border hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
                      </div>
                      {risingStars.find((star: any) => star.employeeId === employee.id) && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleAnalyzeEmployee(employee.id)}
                      disabled={analyzingEmployee === employee.id || analyzeEmployeeMutation.isPending}
                      className="w-full"
                      size="sm"
                    >
                      {analyzingEmployee === employee.id ? (
                        <>
                          <Brain className="w-4 h-4 mr-2 animate-pulse" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze Behavior
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Features Overview */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-green-600" />
            AI Intelligence Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Collaboration Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Identifies team players vs difficult individuals through feedback patterns
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Goal Achievement</h3>
              <p className="text-sm text-muted-foreground">
                Tracks who helps others succeed and drives team performance
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Leadership Pipeline</h3>
              <p className="text-sm text-muted-foreground">
                Automatically surfaces future leaders based on multiple behavioral signals
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Initiative Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Identifies employees who consistently drive improvements and solutions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
}