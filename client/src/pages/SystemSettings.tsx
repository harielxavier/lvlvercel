import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Activity
} from 'lucide-react';

export default function SystemSettings() {
  return (
    <main className="flex-1 ml-80 transition-all duration-300 ease-in-out" data-testid="page-system-settings">
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
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Platform Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication & Security */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Authentication & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Replit Authentication</p>
                  <p className="text-sm text-muted-foreground">OpenID Connect integration</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Session Management</p>
                  <p className="text-sm text-muted-foreground">PostgreSQL session store</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Configured</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Role-Based Access Control</p>
                  <p className="text-sm text-muted-foreground">4-tier permission system</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              
              <Button variant="outline" className="w-full">
                <Key className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </CardContent>
          </Card>

          {/* Database Configuration */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-primary" />
                Database Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">PostgreSQL (Neon)</p>
                  <p className="text-sm text-muted-foreground">Multi-tenant database</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Drizzle ORM</p>
                  <p className="text-sm text-muted-foreground">Type-safe database queries</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Data Isolation</p>
                  <p className="text-sm text-muted-foreground">Tenant-based separation</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Enforced</Badge>
              </div>
              
              <Button variant="outline" className="w-full">
                <Server className="w-4 h-4 mr-2" />
                Database Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Platform Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Platform Super Admins</p>
                  <p className="text-sm text-muted-foreground">3 active administrators</p>
                </div>
                <Button variant="ghost" size="sm">Manage</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Role Assignment</p>
                  <p className="text-sm text-muted-foreground">Automatic role mapping</p>
                </div>
                <Button variant="ghost" size="sm">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Permission Matrix</p>
                  <p className="text-sm text-muted-foreground">Feature access control</p>
                </div>
                <Button variant="ghost" size="sm">Review</Button>
              </div>
              
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                User Settings
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-primary" />
                Notifications & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Feedback alerts, goal reminders, system updates</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Platform Monitoring</p>
                  <p className="text-sm text-muted-foreground">System health & performance tracking</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Critical alerts & performance reviews</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Ready for Setup</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Real-time browser notifications</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Configured</Badge>
              </div>
              
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Test Notification System
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Platform Status */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Platform Status & Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-green-50">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-green-900 mb-1">Security</h3>
                <p className="text-sm text-green-700">All systems secure</p>
                <Badge className="mt-2 bg-green-100 text-green-800">Operational</Badge>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-blue-50">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-blue-900 mb-1">Database</h3>
                <p className="text-sm text-blue-700">Running smoothly</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">Connected</Badge>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-purple-50">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-purple-900 mb-1">Platform</h3>
                <p className="text-sm text-purple-700">Ready for customers</p>
                <Badge className="mt-2 bg-purple-100 text-purple-800">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}