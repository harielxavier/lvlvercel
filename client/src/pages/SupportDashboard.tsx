import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/context/UserContext";
import Sidebar from "@/components/Sidebar";
import {
  TicketIcon,
  MessageCircle,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Shield,
  BookOpen,
  Activity,
  Key,
  Link,
  ChevronDown
} from "lucide-react";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  userId: string;
  tenantId: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  slug: string;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
}

interface SystemHealth {
  id: string;
  component: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  responseTime: number;
  uptime: number;
  errorRate: number;
  lastChecked: string;
}

interface SupportIntegration {
  id: string;
  platform: 'zendesk' | 'freshdesk' | 'salesforce';
  isActive: boolean;
  subdomain?: string;
  instanceUrl?: string;
  lastSyncedAt: string;
  syncErrors: number;
}

const ticketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string().min(1, "Category is required"),
  customerEmail: z.string().email("Valid email is required").optional(),
});

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(['getting_started', 'features', 'billing', 'troubleshooting', 'api', 'security']),
  slug: z.string().min(1, "Slug is required"),
  tags: z.array(z.string()).optional(),
});

const integrationSchema = z.object({
  platform: z.enum(['zendesk', 'freshdesk', 'salesforce']),
  apiKey: z.string().min(1, "API Key is required"),
  subdomain: z.string().optional(),
  instanceUrl: z.string().optional(),
});

export default function SupportDashboard() {
  const { user } = useUserContext();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newArticleOpen, setNewArticleOpen] = useState(false);
  const [integrationOpen, setIntegrationOpen] = useState(false);

  // Forms
  const ticketForm = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium" as const,
      category: "",
      customerEmail: "",
    },
  });

  const articleForm = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "getting_started" as const,
      slug: "",
      tags: [],
    },
  });

  const integrationForm = useForm({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      platform: "zendesk" as const,
      apiKey: "",
      subdomain: "",
      instanceUrl: "",
    },
  });

  // Queries
  const { data: tickets = [] } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets'],
  });

  const { data: knowledgeBase = [] } = useQuery<KnowledgeBaseArticle[]>({
    queryKey: ['/api/knowledge-base'],
  });

  const { data: systemHealth = [] } = useQuery<SystemHealth[]>({
    queryKey: ['/api/system/health'],
  });

  const { data: integrations = [] } = useQuery<SupportIntegration[]>({
    queryKey: ['/api/support/integrations'],
  });

  // Mutations
  const createTicket = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/support/tickets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      toast({
        title: "Ticket Created",
        description: "Support ticket has been created successfully.",
      });
      setNewTicketOpen(false);
      ticketForm.reset();
    },
  });

  const createArticle = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/knowledge-base", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base'] });
      toast({
        title: "Article Created",
        description: "Knowledge base article has been published.",
      });
      setNewArticleOpen(false);
      articleForm.reset();
    },
  });

  const createIntegration = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/support/integrations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/integrations'] });
      toast({
        title: "Integration Configured",
        description: "Support integration has been set up successfully.",
      });
      setIntegrationOpen(false);
      integrationForm.reset();
    },
  });

  const resetPassword = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", "/api/admin/password-reset", { userId }),
    onSuccess: () => {
      toast({
        title: "Password Reset",
        description: "Password reset token has been generated and sent.",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-purple-500';
      case 'pending': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      case 'maintenance': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 lg:ml-80 transition-all duration-300 ease-in-out overflow-auto" data-testid="page-support-dashboard">
        <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Support Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive customer support management
            </p>
          </div>

          <div className="flex gap-2">
            <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-ticket">
                  <TicketIcon className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-new-ticket">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                </DialogHeader>
                <Form {...ticketForm}>
                  <form onSubmit={ticketForm.handleSubmit((data) => createTicket.mutate(data))} className="space-y-4">
                    <FormField
                      control={ticketForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-ticket-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ticketForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} data-testid="input-ticket-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={ticketForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-ticket-priority">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ticketForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., technical, billing" data-testid="input-ticket-category" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={ticketForm.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Email (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" data-testid="input-customer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createTicket.isPending} data-testid="button-create-ticket">
                      {createTicket.isPending ? "Creating..." : "Create Ticket"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={newArticleOpen} onOpenChange={setNewArticleOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-new-article">
                  <BookOpen className="w-4 h-4 mr-2" />
                  New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="dialog-new-article">
                <DialogHeader>
                  <DialogTitle>Create Knowledge Base Article</DialogTitle>
                </DialogHeader>
                <Form {...articleForm}>
                  <form onSubmit={articleForm.handleSubmit((data) => createArticle.mutate(data))} className="space-y-4">
                    <FormField
                      control={articleForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-article-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={articleForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Slug</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="how-to-reset-password" data-testid="input-article-slug" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={articleForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-article-category">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="getting_started">Getting Started</SelectItem>
                              <SelectItem value="features">Features</SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                              <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                              <SelectItem value="api">API</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={articleForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={8} data-testid="input-article-content" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createArticle.isPending} data-testid="button-create-article">
                      {createArticle.isPending ? "Creating..." : "Publish Article"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Open Tickets</p>
                  <p className="text-3xl font-bold" data-testid="stat-open-tickets">
                    {tickets.filter((t: SupportTicket) => t.status === 'open').length}
                  </p>
                </div>
                <TicketIcon className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Knowledge Articles</p>
                  <p className="text-3xl font-bold" data-testid="stat-articles">
                    {knowledgeBase.filter((a: KnowledgeBaseArticle) => a.isPublished).length}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Active Integrations</p>
                  <p className="text-3xl font-bold" data-testid="stat-integrations">
                    {integrations.filter((i: SupportIntegration) => i.isActive).length}
                  </p>
                </div>
                <Link className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">System Health</p>
                  <p className="text-3xl font-bold" data-testid="stat-system-health">
                    {Math.round(systemHealth.filter((h: SystemHealth) => h.status === 'operational').length / Math.max(systemHealth.length, 1) * 100)}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tickets" data-testid="tab-tickets">Tickets</TabsTrigger>
            <TabsTrigger value="knowledge" data-testid="tab-knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
            <TabsTrigger value="health" data-testid="tab-health">System Health</TabsTrigger>
            <TabsTrigger value="admin" data-testid="tab-admin">Admin Tools</TabsTrigger>
          </TabsList>

          {/* Support Tickets */}
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TicketIcon className="w-5 h-5" />
                  Support Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500" data-testid="no-tickets-message">
                      No support tickets found. Create your first ticket above.
                    </div>
                  ) : (
                    tickets.map((ticket: SupportTicket) => (
                      <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" data-testid={`ticket-${ticket.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{ticket.title}</h3>
                              <Badge className={`${getPriorityColor(ticket.priority)} text-white text-xs`}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={`${getStatusColor(ticket.status)} text-white text-xs`}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                              {ticket.description.substring(0, 100)}...
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Category: {ticket.category}</span>
                              <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                              {ticket.customerEmail && <span>Customer: {ticket.customerEmail}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Base */}
          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Knowledge Base Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {knowledgeBase.map((article: KnowledgeBaseArticle) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow" data-testid={`article-${article.id}`}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{article.title}</h3>
                        <Badge variant="outline" className="mb-2">
                          {article.category.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {article.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{article.viewCount} views</span>
                          <span>{article.isPublished ? 'Published' : 'Draft'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Support Platform Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {integrations.map((integration: SupportIntegration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`integration-${integration.platform}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${integration.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <h3 className="font-semibold capitalize">{integration.platform}</h3>
                          <p className="text-sm text-gray-500">
                            Last synced: {integration.lastSyncedAt ? new Date(integration.lastSyncedAt).toLocaleString() : 'Never'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={integration.isActive ? "default" : "secondary"}>
                          {integration.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {integration.syncErrors > 0 && (
                          <Badge variant="destructive">{integration.syncErrors} errors</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Dialog open={integrationOpen} onOpenChange={setIntegrationOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" data-testid="button-new-integration">
                      <Link className="w-4 h-4 mr-2" />
                      Add Integration
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-new-integration">
                    <DialogHeader>
                      <DialogTitle>Configure Support Integration</DialogTitle>
                    </DialogHeader>
                    <Form {...integrationForm}>
                      <form onSubmit={integrationForm.handleSubmit((data) => createIntegration.mutate(data))} className="space-y-4">
                        <FormField
                          control={integrationForm.control}
                          name="platform"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Platform</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-integration-platform">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="zendesk">Zendesk</SelectItem>
                                  <SelectItem value="freshdesk">Freshdesk</SelectItem>
                                  <SelectItem value="salesforce">Salesforce Service Cloud</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={integrationForm.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" data-testid="input-api-key" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={integrationForm.control}
                          name="subdomain"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subdomain (For Zendesk/Freshdesk)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="company.zendesk.com" data-testid="input-subdomain" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={integrationForm.control}
                          name="instanceUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instance URL (For Salesforce)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://company.salesforce.com" data-testid="input-instance-url" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={createIntegration.isPending} data-testid="button-configure-integration">
                          {createIntegration.isPending ? "Configuring..." : "Configure Integration"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health */}
          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Health Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {systemHealth.map((health: SystemHealth) => (
                    <Card key={health.id} className="border-none bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700" data-testid={`health-${health.component}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold capitalize">{health.component}</h3>
                          <Badge className={getHealthStatusColor(health.status)}>
                            {health.status}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Response Time:</span>
                            <span className="text-sm font-medium">{health.responseTime}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Uptime:</span>
                            <span className="text-sm font-medium">{health.uptime}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate:</span>
                            <span className="text-sm font-medium">{health.errorRate}%</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Last checked: {new Date(health.lastChecked).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tools */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Password Management & Admin Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-semibold">Password Reset Tools</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Generate password reset tokens for users. This will send them a secure link to reset their password.
                    </p>
                    <div className="flex gap-2">
                      <Input placeholder="Enter user ID or email" className="flex-1" data-testid="input-password-reset-user" />
                      <Button 
                        onClick={() => {
                          const input = document.querySelector('[data-testid="input-password-reset-user"]') as HTMLInputElement;
                          if (input?.value) {
                            resetPassword.mutate(input.value);
                          }
                        }}
                        disabled={resetPassword.isPending}
                        data-testid="button-reset-password"
                      >
                        {resetPassword.isPending ? "Generating..." : "Reset Password"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-none bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Zap className="w-6 h-6 text-blue-600" />
                          <h3 className="font-semibold">Auto-Escalation</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Automatically escalate high-priority tickets after specified time periods.
                        </p>
                        <Badge className="bg-blue-600 text-white">Active</Badge>
                      </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <MessageCircle className="w-6 h-6 text-green-600" />
                          <h3 className="font-semibold">Live Chat Widget</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Real-time customer support chat integrated across all tenant sites.
                        </p>
                        <Badge className="bg-green-600 text-white">Configured</Badge>
                      </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                          <h3 className="font-semibold">Proactive Alerts</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Monitor system performance and alert customers before issues impact them.
                        </p>
                        <Badge className="bg-purple-600 text-white">Monitoring</Badge>
                      </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertTriangle className="w-6 h-6 text-orange-600" />
                          <h3 className="font-semibold">Status Page</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Public status page showing real-time system health and incident updates.
                        </p>
                        <Badge className="bg-orange-600 text-white">Live</Badge>
                      </CardContent>
                    </Card>
                  </div>
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