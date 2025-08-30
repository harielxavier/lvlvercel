import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Send, Star, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function PeerFeedback() {
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

  // Get colleagues from API
  const { data: colleagues = [], isLoading: colleaguesLoading } = useQuery({
    queryKey: ['/api/employees', user?.tenant?.id],
    enabled: !!user?.tenant?.id,
  });

  // Get received feedback for current user  
  const { data: receivedFeedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['/api/feedback', user?.employee?.id || user?.id],
    enabled: !!user,
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-peer-feedback">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-peer-feedback">
                  Peer Feedback
                </h1>
                <p className="text-sm text-muted-foreground">
                  Exchange feedback with your colleagues and peers
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Give Feedback
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Feedback Given</p>
                    <p className="text-3xl font-bold text-foreground">15</p>
                    <p className="text-sm text-blue-600">this quarter</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Feedback Received</p>
                    <p className="text-3xl font-bold text-green-600">12</p>
                    <p className="text-sm text-green-600">recent responses</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                    <p className="text-3xl font-bold text-foreground">4.6</p>
                    <p className="text-sm text-purple-600">from peers</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                    <p className="text-3xl font-bold text-foreground">89%</p>
                    <p className="text-sm text-orange-600">excellent</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">High</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Give Feedback to Colleagues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select colleague</label>
                    <select className="w-full p-2 border rounded-lg bg-background">
                      <option>Choose a colleague...</option>
                      {colleaguesLoading ? (
                        <option disabled>Loading colleagues...</option>
                      ) : (colleagues as any[]).map((colleague: any, index: number) => (
                        <option key={index} value={`${colleague.firstName} ${colleague.lastName}`}>
                          {colleague.firstName} {colleague.lastName} - {colleague.jobTitle || 'Team Member'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Feedback category</label>
                    <select className="w-full p-2 border rounded-lg bg-background">
                      <option>Select category...</option>
                      <option>Teamwork & Collaboration</option>
                      <option>Communication</option>
                      <option>Technical Skills</option>
                      <option>Leadership</option>
                      <option>Problem Solving</option>
                      <option>Creativity & Innovation</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Your feedback</label>
                    <Textarea 
                      placeholder="Share specific examples and constructive feedback..." 
                      className="min-h-[120px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className="w-6 h-6 text-gray-300 hover:text-yellow-400 cursor-pointer" 
                        />
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Team Directory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {colleaguesLoading ? (
                  <div className="text-center py-4">Loading team directory...</div>
                ) : (colleagues as any[]).map((colleague: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{`${colleague.firstName} ${colleague.lastName}`.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{colleague.firstName} {colleague.lastName}</p>
                        <p className="text-sm text-muted-foreground">{colleague.jobTitle || 'Team Member'}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {colleague.department?.name || 'General'}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Feedback
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Recent Feedback Received</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedbackLoading ? (
                <div className="text-center py-4">Loading feedback...</div>
              ) : (receivedFeedback as any[]).map((feedback: any) => (
                <div key={feedback.id} className="p-4 bg-muted/20 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarFallback>{(feedback.giverName || 'Anonymous').split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{feedback.giverName || 'Anonymous'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex space-x-1">
                            {Array.from({ length: feedback.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {feedback.relationship || 'Peer'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-sm pl-12">{feedback.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}