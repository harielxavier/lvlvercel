import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Palette, Settings, Globe, Save, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";

const websiteSettingsSchema = z.object({
  companyName: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").optional(),
  font: z.enum(['system', 'inter', 'roboto', 'poppins', 'montserrat']).optional(),
  customCss: z.string().optional(),
  footerText: z.string().optional(),
  welcomeMessage: z.string().optional(),
  dashboardTitle: z.string().optional(),
  loginPageTitle: z.string().optional(),
  customDomainEnabled: z.boolean().optional(),
  customDomain: z.string().optional(),
  sslEnabled: z.boolean().optional(),
});

type WebsiteSettingsForm = z.infer<typeof websiteSettingsSchema>;

interface WebsiteSettings extends WebsiteSettingsForm {
  id?: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function WebsiteCustomization() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("branding");

  const form = useForm<WebsiteSettingsForm>({
    resolver: zodResolver(websiteSettingsSchema),
    defaultValues: {
      companyName: "",
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      accentColor: "#06b6d4",
      font: "system",
      customCss: "",
      footerText: "",
      welcomeMessage: "",
      dashboardTitle: "",
      loginPageTitle: "",
      customDomainEnabled: false,
      customDomain: "",
      sslEnabled: true,
    },
  });

  const { data: settings, isLoading } = useQuery<WebsiteSettings>({
    queryKey: [`/api/website-settings/${(user as any)?.tenantId}`],
    enabled: !!(user as any)?.tenantId,
  });

  // Handle form reset when data loads
  React.useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: WebsiteSettingsForm) => {
      return await apiRequest("POST", "/api/website-settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Website customization settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/website-settings/${(user as any)?.tenantId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update website settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WebsiteSettingsForm) => {
    updateSettingsMutation.mutate(data);
  };

  if (!user) {
    return null;
  }

  if ((user as any).role !== 'tenant_admin' && (user as any).role !== 'platform_admin') {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar user={user} />
        <div className="flex-1 lg:ml-80">
          <div className="p-8">
            <Card>
              <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>
                  Only administrators can access website customization settings.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <div className="flex-1 lg:ml-80">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Website Customization</h1>
              <p className="text-muted-foreground mt-2">
                Customize your organization's branding and website appearance
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Admin Only
            </Badge>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="branding" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Branding
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Colors & Fonts
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="domain" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Domain
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="branding" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Brand Identity</CardTitle>
                      <CardDescription>
                        Upload and customize your company's visual identity
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your Company Name" 
                                {...field}
                                data-testid="input-company-name"
                              />
                            </FormControl>
                            <FormDescription>
                              This will appear in the browser tab and header
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/logo.png" 
                                  {...field}
                                  data-testid="input-logo-url"
                                />
                              </FormControl>
                              <FormDescription>
                                URL to your company logo (PNG, SVG, or JPG)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="faviconUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Favicon URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/favicon.ico" 
                                  {...field}
                                  data-testid="input-favicon-url"
                                />
                              </FormControl>
                              <FormDescription>
                                Small icon that appears in browser tabs (16x16px)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch("logoUrl") && (
                        <div className="border rounded-lg p-4">
                          <Label>Logo Preview</Label>
                          <div className="mt-2 flex items-center justify-center h-24 bg-gray-50 dark:bg-gray-800 rounded border">
                            <img 
                              src={form.watch("logoUrl")} 
                              alt="Logo preview" 
                              className="max-h-20 max-w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="colors" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Color Scheme</CardTitle>
                      <CardDescription>
                        Customize the colors to match your brand
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="primaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Color</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    type="color"
                                    {...field}
                                    className="w-12 h-10 p-1 border rounded cursor-pointer"
                                    data-testid="input-primary-color"
                                  />
                                  <Input 
                                    placeholder="#6366f1"
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="flex-1"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="secondaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secondary Color</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    type="color"
                                    {...field}
                                    className="w-12 h-10 p-1 border rounded cursor-pointer"
                                    data-testid="input-secondary-color"
                                  />
                                  <Input 
                                    placeholder="#8b5cf6"
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="flex-1"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accentColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Accent Color</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    type="color"
                                    {...field}
                                    className="w-12 h-10 p-1 border rounded cursor-pointer"
                                    data-testid="input-accent-color"
                                  />
                                  <Input 
                                    placeholder="#06b6d4"
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="flex-1"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <FormField
                        control={form.control}
                        name="font"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Font Family</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-font">
                                  <SelectValue placeholder="Select a font family" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="system">System Default</SelectItem>
                                <SelectItem value="inter">Inter</SelectItem>
                                <SelectItem value="roboto">Roboto</SelectItem>
                                <SelectItem value="poppins">Poppins</SelectItem>
                                <SelectItem value="montserrat">Montserrat</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose the primary font for your website
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customCss"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom CSS</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="/* Add your custom CSS here */&#10;.custom-class {&#10;  color: #your-color;&#10;}"
                                className="min-h-[120px] font-mono text-sm"
                                {...field}
                                data-testid="textarea-custom-css"
                              />
                            </FormControl>
                            <FormDescription>
                              Advanced: Add custom CSS to override default styles
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Text Content</CardTitle>
                      <CardDescription>
                        Customize the text content throughout your website
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="dashboardTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dashboard Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Performance Dashboard" 
                                  {...field}
                                  data-testid="input-dashboard-title"
                                />
                              </FormControl>
                              <FormDescription>
                                Title shown on the main dashboard page
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="loginPageTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Login Page Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Welcome Back" 
                                  {...field}
                                  data-testid="input-login-title"
                                />
                              </FormControl>
                              <FormDescription>
                                Title shown on the login page
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="welcomeMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Welcome Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Welcome to our performance management platform..."
                                {...field}
                                data-testid="textarea-welcome-message"
                              />
                            </FormControl>
                            <FormDescription>
                              Message shown to new users on their first login
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="footerText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Footer Text</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="© 2025 Your Company. All rights reserved." 
                                {...field}
                                data-testid="input-footer-text"
                              />
                            </FormControl>
                            <FormDescription>
                              Text displayed in the website footer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="domain" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Domain</CardTitle>
                      <CardDescription>
                        Set up a custom domain for your website
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="customDomainEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Enable Custom Domain
                              </FormLabel>
                              <FormDescription>
                                Use your own domain instead of the default subdomain
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-custom-domain"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch("customDomainEnabled") && (
                        <>
                          <FormField
                            control={form.control}
                            name="customDomain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Domain Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="hr.yourcompany.com" 
                                    {...field}
                                    data-testid="input-custom-domain"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter your custom domain (without https://)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="sslEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    SSL Certificate
                                  </FormLabel>
                                  <FormDescription>
                                    Enable HTTPS for secure connections
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-ssl"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  Changes will be applied to all users in your organization
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={updateSettingsMutation.isPending}
                    data-testid="button-reset"
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    data-testid="button-save-settings"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}