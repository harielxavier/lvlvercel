import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Copy, Eye, MoreHorizontal, Plus, Search, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Sidebar from "@/components/Sidebar";
import { useUserContext } from "@/context/UserContext";
import { useContext, useEffect } from "react";

const discountCodeSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50, "Code must be under 50 characters"),
  description: z.string().min(1, "Description is required"),
  discountType: z.enum(["percentage", "fixed_amount"]),
  discountValue: z.coerce.number().min(0.01, "Discount value must be greater than 0"),
  minOrderValue: z.coerce.number().min(0, "Minimum order value must be 0 or greater").optional(),
  maxUsageTotal: z.coerce.number().min(-1, "Max usage must be -1 (unlimited) or positive").default(-1),
  maxUsagePerUser: z.coerce.number().min(0, "Max usage per user must be 0 or greater").default(1),
  validUntil: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  campaignName: z.string().optional(),
});

type DiscountCodeForm = z.infer<typeof discountCodeSchema>;

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  minOrderValue?: number;
  maxUsageTotal: number;
  currentUsageCount: number;
  maxUsagePerUser: number;
  validUntil?: string;
  status: "active" | "inactive";
  campaignName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export default function DiscountManagement() {
  const { user } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not platform admin
  useEffect(() => {
    if (user && user.role !== 'platform_admin') {
      toast({
        title: "Access Denied",
        description: "Platform administrator access required.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, toast]);

  const form = useForm<DiscountCodeForm>({
    resolver: zodResolver(discountCodeSchema),
    defaultValues: {
      discountType: "percentage",
      maxUsageTotal: -1,
      maxUsagePerUser: 1,
      status: "active",
    },
  });

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["/api/platform/discount-codes"],
    enabled: user?.role === 'platform_admin',
  });

  const createCodeMutation = useMutation({
    mutationFn: async (data: DiscountCodeForm) => {
      return await apiRequest("POST", "/api/platform/discount-codes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform/discount-codes"] });
      setShowCreateForm(false);
      form.reset();
      toast({
        title: "Success",
        description: "Discount code created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create discount code",
        variant: "destructive",
      });
    },
  });

  const updateCodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DiscountCodeForm> }) => {
      return await apiRequest("PATCH", `/api/platform/discount-codes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform/discount-codes"] });
      toast({
        title: "Success",
        description: "Discount code updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update discount code",
        variant: "destructive",
      });
    },
  });

  const filteredCodes = (discountCodes as DiscountCode[]).filter((code: DiscountCode) =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.campaignName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Discount code copied to clipboard",
    });
  };

  const handleToggleStatus = async (code: DiscountCode) => {
    const newStatus = code.status === "active" ? "inactive" : "active";
    updateCodeMutation.mutate({ 
      id: code.id, 
      data: { status: newStatus } 
    });
  };

  const onSubmit = (data: DiscountCodeForm) => {
    createCodeMutation.mutate(data);
  };

  if (!user || user.role !== 'platform_admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-80">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Discount Code Management</h1>
              <p className="text-muted-foreground mt-2">
                Create and manage promotional discount codes for customer acquisition
              </p>
            </div>
            
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-discount">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Discount Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Discount Code</DialogTitle>
                  <DialogDescription>
                    Set up a new promotional discount code for customers
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Code</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., WELCOME20" 
                                {...field}
                                data-testid="input-discount-code"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="campaignName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Welcome Campaign" 
                                {...field}
                                data-testid="input-campaign-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe this discount code..." 
                              {...field}
                              data-testid="input-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-discount-type">
                                  <SelectValue placeholder="Select discount type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discountValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {form.watch("discountType") === "percentage" ? "Percentage" : "Amount ($)"}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder={form.watch("discountType") === "percentage" ? "20" : "10.00"}
                                {...field}
                                data-testid="input-discount-value"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="minOrderValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Order Value ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                data-testid="input-min-order"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxUsageTotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Total Uses</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="-1 for unlimited"
                                {...field}
                                data-testid="input-max-total-uses"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxUsagePerUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Uses Per User</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="1"
                                {...field}
                                data-testid="input-max-user-uses"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid Until (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              {...field}
                              data-testid="input-valid-until"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCreateForm(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createCodeMutation.isPending}
                        data-testid="button-submit"
                      >
                        {createCodeMutation.isPending ? "Creating..." : "Create Code"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search discount codes, descriptions, or campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-48 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCodes.map((code: DiscountCode) => (
                <Card key={code.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono" data-testid={`text-code-${code.id}`}>
                        {code.code}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={code.status === "active" ? "default" : "secondary"}
                          data-testid={`badge-status-${code.id}`}
                        >
                          {code.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(code.code)}
                          data-testid={`button-copy-${code.id}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription data-testid={`text-description-${code.id}`}>
                      {code.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="font-medium" data-testid={`text-discount-${code.id}`}>
                          {code.discountType === "percentage" 
                            ? `${code.discountValue}%` 
                            : `$${code.discountValue}`
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Usage:</span>
                        <span data-testid={`text-usage-${code.id}`}>
                          {code.currentUsageCount} / {code.maxUsageTotal === -1 ? "∞" : code.maxUsageTotal}
                        </span>
                      </div>

                      {code.validUntil && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires:</span>
                          <span data-testid={`text-expires-${code.id}`}>
                            {format(new Date(code.validUntil), "MMM dd, yyyy")}
                          </span>
                        </div>
                      )}

                      {code.campaignName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Campaign:</span>
                          <span data-testid={`text-campaign-${code.id}`}>
                            {code.campaignName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <Switch
                        checked={code.status === "active"}
                        onCheckedChange={() => handleToggleStatus(code)}
                        data-testid={`switch-status-${code.id}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCode(code)}
                        data-testid={`button-view-${code.id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredCodes.length === 0 && !isLoading && (
            <Card className="text-center py-12">
              <CardContent>
                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No discount codes found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first discount code to get started"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateForm(true)} data-testid="button-create-first">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Discount Code
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}