import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Plus, Clock, Video, MessageSquare, Users } from 'lucide-react';
import { useEffect } from 'react';

export default function Meetings() {
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

  const upcomingMeetings = [
    {
      id: 1,
      participant: "Sarah Chen",
      date: "2024-01-25",
      time: "2:00 PM",
      duration: "30 min",
      status: "scheduled",
      type: "Performance Review"
    },
    {
      id: 2,
      participant: "Mike Johnson",
      date: "2024-01-26",
      time: "10:00 AM",
      duration: "45 min",
      status: "confirmed",
      type: "Goal Planning"
    },
    {
      id: 3,
      participant: "Alex Rodriguez",
      date: "2024-01-27",
      time: "3:30 PM",
      duration: "30 min",
      status: "pending",
      type: "Career Development"
    }
  ];

  const completedMeetings = [
    {
      id: 4,
      participant: "Emma Williams",
      date: "2024-01-20",
      time: "11:00 AM",
      duration: "30 min",
      type: "Check-in",
      notes: "Discussed project progress and upcoming challenges"
    }
  ];

  return (
    <AppLayout user={user}>
      <main className="flex-1 min-h-screen transition-all duration-300 ease-in-out" data-testid="page-meetings">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-meetings">
                  1:1 Meetings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Schedule and manage one-on-one meetings with your team
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Meeting
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
                    <p className="text-sm font-medium text-muted-foreground">This Week</p>
                    <p className="text-3xl font-bold text-foreground">3</p>
                    <p className="text-sm text-blue-600">meetings scheduled</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                    <p className="text-3xl font-bold text-foreground">12.5</p>
                    <p className="text-sm text-green-600">this month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                    <p className="text-3xl font-bold text-foreground">4</p>
                    <p className="text-sm text-purple-600">regular 1:1s</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-3xl font-bold text-foreground">95%</p>
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
                <CardTitle>Upcoming Meetings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{meeting.participant.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{meeting.participant}</p>
                        <p className="text-sm text-muted-foreground">{meeting.type}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {meeting.date} at {meeting.time} ({meeting.duration})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        meeting.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }>
                        {meeting.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Video className="w-3 h-3 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Recent Meetings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {completedMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 bg-muted/20 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{meeting.participant.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{meeting.participant}</p>
                          <p className="text-sm text-muted-foreground">{meeting.type}</p>
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{meeting.date} at {meeting.time} ({meeting.duration})</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm">{meeting.notes}</p>
                    </div>
                  </div>
                ))}

                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No more recent meetings</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Meeting Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:bg-muted/20 cursor-pointer">
                  <h4 className="font-medium mb-2">Performance Review</h4>
                  <p className="text-sm text-muted-foreground">Quarterly performance discussion and goal setting</p>
                  <p className="text-xs text-muted-foreground mt-2">Duration: 45-60 minutes</p>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-muted/20 cursor-pointer">
                  <h4 className="font-medium mb-2">Career Development</h4>
                  <p className="text-sm text-muted-foreground">Focus on career growth and development opportunities</p>
                  <p className="text-xs text-muted-foreground mt-2">Duration: 30-45 minutes</p>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-muted/20 cursor-pointer">
                  <h4 className="font-medium mb-2">Weekly Check-in</h4>
                  <p className="text-sm text-muted-foreground">Regular progress updates and support</p>
                  <p className="text-xs text-muted-foreground mt-2">Duration: 15-30 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppLayout>
  );
}