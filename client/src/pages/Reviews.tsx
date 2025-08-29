import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Plus, Calendar, Clock, Star, Filter } from 'lucide-react';
import { useEffect } from 'react';\nimport { useQuery } from '@tanstack/react-query';\nimport { Skeleton } from '@/components/ui/skeleton';

export default function Reviews() {
  const { user, isLoading, isAuthenticated } = useUserContext();
  const { toast } = useToast();

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

  const reviews = [
    { 
      id: 1, 
      employee: "Sarah Chen", 
      type: "Quarterly Review", 
      status: "completed", 
      score: 4.8, 
      date: "2024-01-15" 
    },
    { 
      id: 2, 
      employee: "Mike Johnson", 
      type: "Mid-Year Review", 
      status: "in_progress", 
      score: null, 
      date: "2024-01-20" 
    },
    { 
      id: 3, 
      employee: "Alex Rodriguez", 
      type: "Quarterly Review", 
      status: "scheduled", 
      score: null, 
      date: "2024-01-25" 
    },
  ];

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
                <Button className="bg-primary hover:bg-primary/90">
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
                    <p className="text-3xl font-bold text-foreground">24</p>
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
                    <p className="text-3xl font-bold text-green-600">18</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">75%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-3xl font-bold text-orange-600">4</p>
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
                    <p className="text-3xl font-bold text-foreground">4.6</p>
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
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{review.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.employee}</p>
                        <p className="text-sm text-muted-foreground">{review.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{review.date}</span>
                        </div>
                        {review.score && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{review.score}</span>
                          </div>
                        )}
                      </div>
                      
                      <Badge className={
                        review.status === 'completed' ? 'bg-green-100 text-green-800' :
                        review.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {review.status.replace('_', ' ')}
                      </Badge>
                      
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}