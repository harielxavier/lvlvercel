import { useState, useEffect } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import CreatePerformanceReviewForm from '@/components/CreatePerformanceReviewForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Plus, Calendar, Clock, Star, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  overallScore?: number;
  competencyScores?: Record<string, number>;
  comments?: string;
  goals?: any[];
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
  updatedAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    profileImageUrl?: string;
  };
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  profileImageUrl?: string;
}

export default function Reviews() {
  const { user, isLoading, isAuthenticated } = useUserContext();
  const { toast } = useToast();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);

  // Fetch performance reviews for the tenant
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<PerformanceReview[]>({
    queryKey: ['/api/performance-reviews', user?.tenant?.id],
    enabled: !!user?.tenant?.id,
  });

  // Fetch employees to get employee data for reviews
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees', user?.tenant?.id],
    enabled: !!user?.tenant?.id,
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest('DELETE', `/api/performance-review/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/performance-reviews'] });
      toast({
        title: "Review Deleted",
        description: "Performance review has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete performance review.",
        variant: "destructive",
      });
    }
  });

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

  // Calculate metrics from real data
  const totalReviews = reviews.length;
  const completedReviews = reviews.filter(r => r.status === 'approved').length;
  const inProgressReviews = reviews.filter(r => r.status === 'submitted').length;
  const avgScore = reviews.filter(r => r.overallScore).reduce((acc, r) => acc + (r.overallScore || 0), 0) / reviews.filter(r => r.overallScore).length || 0;

  const handleEditReview = (review: PerformanceReview) => {
    setEditingReview(review);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this performance review?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const getEmployeeData = (employeeId: string) => {
    return employees.find((emp: Employee) => emp.id === employeeId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-reviews">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-reviews">
                  Performance Reviews
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage and track performance reviews for your team
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90" 
                  onClick={() => setIsCreateFormOpen(true)}
                  data-testid="button-create-review"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Review
                </Button>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                    <p className="text-3xl font-bold text-foreground">{totalReviews}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{completedReviews}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-3xl font-bold text-orange-600">{inProgressReviews}</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                    <p className="text-3xl font-bold text-foreground">{avgScore ? avgScore.toFixed(1) : 'N/A'}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Performance Reviews Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first performance review.
                  </p>
                  <Button onClick={() => setIsCreateFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Review
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const employee = getEmployeeData(review.employeeId);
                    return (
                      <div key={review.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage 
                              src={employee?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.employeeId}`}
                              alt={employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'}
                            />
                            <AvatarFallback>
                              {employee 
                                ? `${employee.firstName?.charAt(0)}${employee.lastName?.charAt(0)}`
                                : 'EE'
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {employee 
                                ? `${employee.firstName} ${employee.lastName}` 
                                : 'Unknown Employee'
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">{review.reviewPeriod}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {review.overallScore && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{review.overallScore}/5</span>
                              </div>
                            )}
                          </div>
                          
                          <Badge className={getStatusColor(review.status)}>
                            {review.status}
                          </Badge>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditReview(review)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Upcoming Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Reviews</h3>
                <p className="text-muted-foreground mb-4">
                  All reviews are up to date. Schedule new reviews to keep track of team performance.
                </p>
                <Button onClick={() => setIsCreateFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create/Edit Performance Review Form */}
      <CreatePerformanceReviewForm
        isOpen={isCreateFormOpen || !!editingReview}
        onClose={() => {
          setIsCreateFormOpen(false);
          setEditingReview(null);
        }}
        tenantId={user?.tenant?.id || ''}
        reviewerId={user?.id || ''}
        editReview={editingReview}
      />
    </div>
  );
}