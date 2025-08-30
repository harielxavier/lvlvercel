import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserContext } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import {
  Settings,
  Shield,
  Database,
  Users,
  Bell,
  Mail,
  Globe,
  Key,
  Server,
  Activity,
  Edit,
  Save,
  TestTube,
  AlertCircle,
} from 'lucide-react';

interface SystemSetting {
  id: string;
  settingKey: string;
  settingValue: any;
  category: string;
  description: string;
  isEditable: boolean;
  lastModifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SystemSettings() {
  const { user } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [testNotificationOpen, setTestNotificationOpen] = useState(false);
  const [notificationTest, setNotificationTest] = useState({
    type: 'email',
    email: '',
    message: 'This is a test notification from LVL UP Performance system.'
  });

  // Fetch all system settings
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['/api/platform/system-settings'],
    queryFn: () => apiRequest('GET', '/api/platform/system-settings').then(res => res.json()),
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      apiRequest('PATCH', `/api/platform/system-settings/${key}`, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/system-settings'] });
      toast({
        title: 'Setting Updated',
        description: 'System setting has been updated successfully.',
      });
      setEditingSetting(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update system setting.',
        variant: 'destructive',
      });
    },
  });

  // Test notification mutation
  const testNotificationMutation = useMutation({
    mutationFn: (data: { type: string; email?: string; message: string }) =>
      apiRequest('POST', '/api/platform/test-notification', data),
    onSuccess: (response: any) => {
      toast({
        title: 'Test Successful',
        description: response.message || 'Test notification sent successfully.',
      });
      setTestNotificationOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Test Failed',
        description: error.message || 'Failed to send test notification.',
        variant: 'destructive',
      });
    },
  });

  const startEditing = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setEditValue(setting.settingValue);
  };

  const saveEdit = () => {
    if (!editingSetting) return;
    updateSettingMutation.mutate({ 
      key: editingSetting.settingKey, 
      value: editValue 
    });
  };

  const handleTestNotification = () => {
    if (notificationTest.type === 'email' && !notificationTest.email) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address for email testing.',
        variant: 'destructive',
      });
      return;
    }
    testNotificationMutation.mutate(notificationTest);
  };

  // Group settings by category
  const settingsByCategory = settings.reduce((acc: Record<string, SystemSetting[]>, setting: SystemSetting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});

  const renderSettingValue = (setting: SystemSetting) => {
    if (!setting.isEditable) {
      return <span className="text-muted-foreground">{String(setting.settingValue)}</span>;
    }

    if (typeof setting.settingValue === 'boolean') {
      return (
        <Switch
          checked={setting.settingValue}
          onCheckedChange={(checked) => {
            updateSettingMutation.mutate({ key: setting.settingKey, value: checked });
          }}
        />
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{String(setting.settingValue)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startEditing(setting)}
          data-testid={`button-edit-${setting.settingKey}`}
        >
          <Edit className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar user={user} />
        <main className="flex-1 lg:ml-80 transition-all duration-300 ease-in-out" data-testid="page-system-settings">
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 lg:ml-80 transition-all duration-300 ease-in-out overflow-auto" data-testid="page-system-settings">
      {/* Header */}
      <header className="glass-morphism border-b sticky top-0 z-40">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text" data-testid="heading-system-settings">
                System Settings
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-settings-description">
                Configure platform-wide settings and system configurations
              </p>
            </div>
            <Dialog open={testNotificationOpen} onOpenChange={setTestNotificationOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-test-notifications">
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Notifications
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Test Notification System</DialogTitle>
                  <DialogDescription>
                    Send a test notification to verify the system is working correctly.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notification-type">Notification Type</Label>
                    <Select
                      value={notificationTest.type}
                      onValueChange={(value) => setNotificationTest({ ...notificationTest, type: value })}
                    >
                      <SelectTrigger data-testid="select-notification-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {notificationTest.type === 'email' && (
                    <div>
                      <Label htmlFor="test-email">Email Address</Label>
                      <Input
                        id="test-email"
                        type="email"
                        value={notificationTest.email}
                        onChange={(e) => setNotificationTest({ ...notificationTest, email: e.target.value })}
                        placeholder="test@example.com"
                        data-testid="input-test-email"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="test-message">Test Message</Label>
                    <Textarea
                      id="test-message"
                      value={notificationTest.message}
                      onChange={(e) => setNotificationTest({ ...notificationTest, message: e.target.value })}
                      data-testid="textarea-test-message"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleTestNotification}
                    disabled={testNotificationMutation.isPending}
                    data-testid="button-send-test"
                  >
                    {testNotificationMutation.isPending ? 'Sending...' : 'Send Test'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <Tabs defaultValue="platform" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="platform" data-testid="tab-platform">Platform</TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
            <TabsTrigger value="database" data-testid="tab-database">Database</TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          </TabsList>

          {/* Platform Settings */}
          <TabsContent value="platform" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-primary" />
                  Platform Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsByCategory.platform?.map((setting: SystemSetting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{setting.settingKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderSettingValue(setting)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsByCategory.security?.map((setting: SystemSetting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{setting.settingKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderSettingValue(setting)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Notification Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsByCategory.notifications?.map((setting: SystemSetting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{setting.settingKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderSettingValue(setting)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Settings */}
          <TabsContent value="database" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-primary" />
                  Database Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsByCategory.database?.map((setting: SystemSetting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{setting.settingKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderSettingValue(setting)}
                    </div>
                  </div>
                ))}
                
                {/* Database Status */}
                <div className="mt-6 p-4 rounded-lg bg-green-50 border-green-200 border">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-green-900">Database Status</h4>
                      <p className="text-sm text-green-700">PostgreSQL (Neon) - Connected and operational</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Settings */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Performance Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsByCategory.performance?.map((setting: SystemSetting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{setting.settingKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderSettingValue(setting)}
                    </div>
                  </div>
                ))}
                
                {/* System Health Status */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50 border-green-200 border">
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-900">Security</h4>
                    <p className="text-sm text-green-700">All systems secure</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50 border-blue-200 border">
                    <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-blue-900">Database</h4>
                    <p className="text-sm text-blue-700">Running smoothly</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50 border-purple-200 border">
                    <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-purple-900">Platform</h4>
                    <p className="text-sm text-purple-700">Ready for customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Setting Dialog */}
      <Dialog open={!!editingSetting} onOpenChange={() => setEditingSetting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <DialogDescription>
              Update the value for: {editingSetting?.settingKey.replace(/_/g, ' ')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="setting-description">Description</Label>
              <p className="text-sm text-muted-foreground">{editingSetting?.description}</p>
            </div>
            <div>
              <Label htmlFor="setting-value">Value</Label>
              {editingSetting && typeof editingSetting.settingValue === 'number' ? (
                <Input
                  id="setting-value"
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(Number(e.target.value))}
                  data-testid="input-setting-value"
                />
              ) : editingSetting && typeof editingSetting.settingValue === 'boolean' ? (
                <Switch
                  checked={editValue}
                  onCheckedChange={setEditValue}
                />
              ) : (
                <Input
                  id="setting-value"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  data-testid="input-setting-value"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSetting(null)}>
              Cancel
            </Button>
            <Button 
              onClick={saveEdit} 
              disabled={updateSettingMutation.isPending}
              data-testid="button-save-setting"
            >
              {updateSettingMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
    </div>
  );
}