import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Camera, Bell, Shield, Key, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    feedbackNotifications: true,
    goalReminders: true,
    weeklyDigest: false,
  });

  // Fetch current notification preferences
  const { data: preferencesData, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/notification-preferences'],
    enabled: !!isAuthenticated && !!user,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: any) => apiRequest('/api/notification-preferences', 'PUT', preferences),
    onSuccess: () => {
      toast({
        title: '✅ Settings Saved',
        description: 'Your notification preferences have been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
    },
    onError: (error) => {
      toast({
        title: '❌ Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    },
  });

  // Update local state when data is loaded
  useEffect(() => {
    if (preferencesData) {
      setNotificationPreferences({
        emailNotifications: (preferencesData as any).emailNotifications ?? true,
        pushNotifications: (preferencesData as any).pushNotifications ?? true,
        feedbackNotifications: (preferencesData as any).feedbackNotifications ?? true,
        goalReminders: (preferencesData as any).goalReminders ?? true,
        weeklyDigest: (preferencesData as any).weeklyDigest ?? false,
      });
    }
  }, [preferencesData]);

  const handleSaveNotificationSettings = () => {
    updatePreferencesMutation.mutate(notificationPreferences);
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

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
      <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-profile">
        <header className="glass-morphism border-b sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text" data-testid="heading-profile">
                  Profile Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your personal information and preferences
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback className="text-lg">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{user.firstName} {user.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {user.role?.replace('_', ' ')} {user.tenant?.name && `• ${user.tenant.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={user.firstName || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user.lastName || ''} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user.email || ''} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Tell us a little about yourself..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills & Expertise</Label>
                    <Input 
                      id="skills" 
                      placeholder="e.g., React, Project Management, Data Analysis..."
                    />
                  </div>

                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive feedback and review notifications via email</p>
                      </div>
                      <Switch 
                        id="email-notifications" 
                        checked={notificationPreferences.emailNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                        disabled={preferencesLoading}
                        data-testid="switch-email-notifications"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications">Browser Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get real-time updates in your browser</p>
                      </div>
                      <Switch 
                        id="push-notifications" 
                        checked={notificationPreferences.pushNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                        disabled={preferencesLoading}
                        data-testid="switch-push-notifications"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="feedback-notifications">Feedback Notifications</Label>
                        <p className="text-sm text-muted-foreground">Be notified when you receive new feedback</p>
                      </div>
                      <Switch 
                        id="feedback-notifications" 
                        checked={notificationPreferences.feedbackNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('feedbackNotifications', checked)}
                        disabled={preferencesLoading}
                        data-testid="switch-feedback-notifications"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="goal-reminders">Goal Reminders</Label>
                        <p className="text-sm text-muted-foreground">Receive reminders about upcoming goal deadlines</p>
                      </div>
                      <Switch 
                        id="goal-reminders" 
                        checked={notificationPreferences.goalReminders}
                        onCheckedChange={(checked) => handlePreferenceChange('goalReminders', checked)}
                        disabled={preferencesLoading}
                        data-testid="switch-goal-reminders"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weekly-digest">Weekly Digest</Label>
                        <p className="text-sm text-muted-foreground">Get a weekly summary of your performance</p>
                      </div>
                      <Switch 
                        id="weekly-digest" 
                        checked={notificationPreferences.weeklyDigest}
                        onCheckedChange={(checked) => handlePreferenceChange('weeklyDigest', checked)}
                        disabled={preferencesLoading}
                        data-testid="switch-weekly-digest"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveNotificationSettings}
                    disabled={updatePreferencesMutation.isPending || preferencesLoading}
                    data-testid="button-save-notification-settings"
                  >
                    {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Privacy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="profile-visibility">Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">Make your profile visible to other team members</p>
                      </div>
                      <Switch id="profile-visibility" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="feedback-visibility">Feedback Visibility</Label>
                        <p className="text-sm text-muted-foreground">Allow others to see feedback you've received</p>
                      </div>
                      <Switch id="feedback-visibility" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="goal-visibility">Goal Visibility</Label>
                        <p className="text-sm text-muted-foreground">Share your goals with team members</p>
                      </div>
                      <Switch id="goal-visibility" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="anonymous-feedback">Anonymous Feedback</Label>
                        <p className="text-sm text-muted-foreground">Allow anonymous feedback about you</p>
                      </div>
                      <Switch id="anonymous-feedback" defaultChecked />
                    </div>
                  </div>

                  <Button>Update Privacy Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>

                    <Button>Update Password</Button>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch id="two-factor" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}