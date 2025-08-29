import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Link as LinkIcon, QrCode, Copy, Share, Eye } from 'lucide-react';
import { useEffect } from 'react';

export default function FeedbackCollection() {
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

  const feedbackUrl = `https://lvlup.app/feedback/${user.id}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Feedback URL copied to clipboard",
    });
  };

  const feedbackStats = [
    { label: "Total Responses", value: "47", change: "+12 this week" },
    { label: "Avg Rating", value: "4.8", change: "+0.3 from last month" },
    { label: "Response Rate", value: "73%", change: "Above average" },
    { label: "Latest Response", value: "2h ago", change: "Very recent" }
  ];

  const recentFeedback = [
    {
      id: 1,
      rating: 5,
      comment: "Excellent collaboration and communication skills. Always willing to help team members.",
      date: "2024-01-20",
      source: "Anonymous Colleague"
    },
    {
      id: 2,
      rating: 4,
      comment: "Great technical expertise and problem-solving abilities. Could improve on documentation.",
      date: "2024-01-19",
      source: "Project Partner"
    },
    {
      id: 3,
      rating: 5,
      comment: "Outstanding leadership during the project. Kept everyone motivated and on track.",
      date: "2024-01-18",
      source: "Team Member"
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-feedback-collection">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-feedback-collection">
                  Feedback Collection
                </h1>
                <p className="text-sm text-muted-foreground">
                  Collect feedback from colleagues, clients, and partners
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Share className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {feedbackStats.map((stat, index) => (
              <Card key={index} className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LinkIcon className="w-5 h-5 mr-2" />
                Your Feedback Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">
                  Share this personalized link to collect feedback from anyone:
                </p>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={feedbackUrl} 
                    readOnly 
                    className="font-mono text-sm bg-background"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(feedbackUrl)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">QR Code</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate a QR code for easy mobile access
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Generate QR
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Share className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Email Template</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pre-written email template for feedback requests
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Get Template
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Preview Form</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    See how your feedback form appears to others
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentFeedback.map((feedback) => (
                <div key={feedback.id} className="p-4 bg-muted/20 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {Array.from({ length: feedback.rating }).map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feedback.rating}/5
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{feedback.date}</span>
                  </div>
                  
                  <p className="text-sm">{feedback.comment}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">From: {feedback.source}</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}