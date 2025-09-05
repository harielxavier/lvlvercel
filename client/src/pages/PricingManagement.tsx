import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPricingTierSchema, type PricingTier } from "@shared/schema";
import { Plus, Edit, Trash2, DollarSign, Users, Star, Eye, History, Crown, Zap, Shield, Target, TrendingUp, Sparkles } from "lucide-react";
import { z } from "zod";
import Sidebar from "@/components/Sidebar";
import { useUserContext } from "@/context/UserContext";

const pricingTierFormSchema = insertPricingTierSchema.extend({
  features: z.array(z.string()).min(1, "At least one feature is required"),
});

type PricingTierFormData = z.infer<typeof pricingTierFormSchema>;

export default function PricingManagement() {
  const { user } = useUserContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTier, setDeletingTier] = useState<PricingTier | null>(null);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [featuresInput, setFeaturesInput] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const form = useForm<PricingTierFormData>({
    resolver: zodResolver(pricingTierFormSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxSeats: -1,
      features: [],
      targetMarket: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  // Fetch pricing tiers
  const { data: pricingTiers = [], isLoading } = useQuery({
    queryKey: ["/api/platform/pricing-tiers"],
    queryFn: () => apiRequest("GET", "/api/platform/pricing-tiers").then((res) => res.json()),
  });

  // Fetch audit log
  const { data: auditLog = [] } = useQuery({
    queryKey: ["/api/platform/billing-audit"],
    queryFn: () => apiRequest("GET", "/api/platform/billing-audit").then((res) => res.json()),
    enabled: isAuditDialogOpen,
  });

  // Create pricing tier mutation
  const createTierMutation = useMutation({
    mutationFn: (data: PricingTierFormData) =>
      apiRequest("POST", "/api/platform/pricing-tiers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform/pricing-tiers"] });
      setIsCreateDialogOpen(false);
      form.reset();
      setFeaturesInput("");
      toast({
        title: "Success",
        description: "Pricing tier created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create pricing tier",
        variant: "destructive",
      });
    },
  });

  // Update pricing tier mutation
  const updateTierMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PricingTierFormData> }) =>
      apiRequest("PUT", `/api/platform/pricing-tiers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform/pricing-tiers"] });
      setIsEditDialogOpen(false);
      setEditingTier(null);
      form.reset();
      setFeaturesInput("");
      toast({
        title: "Success",
        description: "Pricing tier updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing tier",
        variant: "destructive",
      });
    },
  });

  // Delete pricing tier mutation
  const deleteTierMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/platform/pricing-tiers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform/pricing-tiers"] });
      setIsDeleteDialogOpen(false);
      setDeletingTier(null);
      toast({
        title: "Success",
        description: "Pricing tier deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pricing tier",
        variant: "destructive",
      });
    },
  });

  const handleCreateTier = (data: PricingTierFormData) => {
    const features = featuresInput
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);
    
    createTierMutation.mutate({
      ...data,
      features,
      monthlyPrice: Math.round(data.monthlyPrice * 100), // Convert to cents
      yearlyPrice: Math.round(data.yearlyPrice * 100), // Convert to cents
    });
  };

  const handleUpdateTier = (data: PricingTierFormData) => {
    if (!editingTier) return;
    
    const features = featuresInput
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);
    
    updateTierMutation.mutate({
      id: editingTier.id,
      data: {
        ...data,
        features,
        monthlyPrice: Math.round(data.monthlyPrice * 100), // Convert to cents
        yearlyPrice: Math.round(data.yearlyPrice * 100), // Convert to cents
      },
    });
  };

  const handleEditTier = (tier: PricingTier) => {
    setEditingTier(tier);
    form.reset({
      id: tier.id,
      name: tier.name,
      description: tier.description || "",
      monthlyPrice: tier.monthlyPrice / 100, // Convert from cents
      yearlyPrice: tier.yearlyPrice / 100, // Convert from cents
      maxSeats: tier.maxSeats,
      features: tier.features as string[],
      targetMarket: tier.targetMarket || "",
      isActive: tier.isActive,
      sortOrder: tier.sortOrder,
    });
    setFeaturesInput((tier.features as string[]).join('\n'));
    setIsEditDialogOpen(true);
  };

  const handleDeleteTier = (tier: PricingTier) => {
    setDeletingTier(tier);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTier) {
      deleteTierMutation.mutate(deletingTier.id);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.role !== 'platform_admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar user={user} />
        <div className="flex-1 lg:ml-80">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 p-8 mb-8 text-white">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8" />
                    <h1 className="text-4xl font-bold tracking-tight">Pricing Management</h1>
                  </div>
                  <p className="text-lg text-white/90 max-w-2xl">
                    Design and manage subscription tiers that scale with your customers' success. 
                    Create compelling value propositions that drive growth.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setIsAuditDialogOpen(true)}
                    data-testid="button-view-audit-log"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Audit Log
                  </Button>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    data-testid="button-create-tier"
                    className="bg-white text-purple-600 hover:bg-white/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tier
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Tiers Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pricingTiers.map((tier: PricingTier, index: number) => {
              const isPopular = index === 1; // Make middle tier popular
              const tierIcons = [Star, Zap, Crown, Shield, Target, TrendingUp];
              const TierIcon = tierIcons[index % tierIcons.length];
              
              return (
                <Card 
                  key={tier.id} 
                  className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    isPopular 
                      ? 'ring-2 ring-purple-500 shadow-xl border-purple-200 dark:border-purple-800' 
                      : 'hover:shadow-lg'
                  }`} 
                  data-testid={`card-pricing-tier-${tier.id}`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
                  )}
                  {isPopular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isPopular 
                            ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' 
                            : 'bg-muted'
                        }`}>
                          <TierIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2 text-xl">
                            {tier.name}
                            {!tier.isActive && (
                              <Badge variant="secondary" data-testid={`badge-inactive-${tier.id}`}>
                                Inactive
                              </Badge>
                            )}
                          </CardTitle>
                          {tier.description && (
                            <CardDescription className="mt-1">{tier.description}</CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTier(tier)}
                          data-testid={`button-edit-${tier.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTier(tier)}
                          data-testid={`button-delete-${tier.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Pricing Display */}
                    <div className="text-center pb-4 border-b">
                      <div className="space-y-2">
                        <div className={`text-3xl font-bold ${
                          isPopular ? 'text-purple-600 dark:text-purple-400' : ''
                        }`} data-testid={`text-monthly-price-${tier.id}`}>
                          {formatPrice(tier.monthlyPrice)}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </div>
                        <div className="text-sm text-muted-foreground" data-testid={`text-yearly-price-${tier.id}`}>
                          {formatPrice(tier.yearlyPrice)}/year (save {Math.round((1 - (tier.yearlyPrice / 12) / tier.monthlyPrice) * 100)}%)
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Max Seats</span>
                        </div>
                        <div className="font-semibold" data-testid={`text-max-seats-${tier.id}`}>
                          {tier.maxSeats === -1 ? "∞" : tier.maxSeats}
                        </div>
                      </div>
                      
                      {tier.targetMarket && (
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Target</span>
                          </div>
                          <div className="text-sm font-medium" data-testid={`text-target-market-${tier.id}`}>
                            {tier.targetMarket}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    <div>
                      <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Features
                      </div>
                      <div className="space-y-2">
                        {(tier.features as string[]).slice(0, 4).map((feature, featureIndex) => (
                          <div key={featureIndex} className="text-sm flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              isPopular ? 'bg-purple-500' : 'bg-primary'
                            }`} />
                            {feature}
                          </div>
                        ))}
                        {(tier.features as string[]).length > 4 && (
                          <div className="text-sm text-muted-foreground font-medium">
                            +{(tier.features as string[]).length - 4} more features
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Create/Edit Tier Dialog */}
          <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setEditingTier(null);
              form.reset();
              setFeaturesInput("");
            }
          }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-tier-form">
              {editingTier ? "Edit Pricing Tier" : "Create New Pricing Tier"}
            </DialogTitle>
            <DialogDescription>
              {editingTier 
                ? "Update the pricing tier details below." 
                : "Create a new pricing tier for your platform."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(editingTier ? handleUpdateTier : handleCreateTier)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., forming, storming" 
                          {...field} 
                          disabled={editingTier !== null}
                          data-testid="input-tier-id"
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this tier (cannot be changed after creation)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Professional" {...field} data-testid="input-tier-name" />
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
                        placeholder="Brief description of this tier..." 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-tier-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthlyPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="29.99" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-monthly-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearlyPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yearly Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="299.99" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-yearly-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Seats</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="-1 for unlimited" 
                          {...field}
                          value={field.value || -1}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || -1)}
                          data-testid="input-max-seats"
                        />
                      </FormControl>
                      <FormDescription>
                        -1 for unlimited seats
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          value={field.value || 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-sort-order"
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="targetMarket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Market</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Small teams, Enterprise" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-target-market"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  rows={6}
                  data-testid="input-features"
                />
                <p className="text-sm text-muted-foreground">
                  Enter each feature on a new line
                </p>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Whether this tier is available for new subscriptions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        data-testid="switch-is-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setEditingTier(null);
                    form.reset();
                    setFeaturesInput("");
                  }}
                  data-testid="button-cancel-tier-form"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTierMutation.isPending || updateTierMutation.isPending}
                  data-testid="button-save-tier"
                >
                  {createTierMutation.isPending || updateTierMutation.isPending ? "Saving..." : "Save Tier"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent data-testid="dialog-delete-confirmation">
          <DialogHeader>
            <DialogTitle>Delete Pricing Tier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{deletingTier?.name}" pricing tier? 
              This action will mark it as inactive and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteTierMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteTierMutation.isPending ? "Deleting..." : "Delete Tier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-audit-log">Billing Audit Log</DialogTitle>
            <DialogDescription>
              Recent changes to pricing tiers and tenant billing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {auditLog.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No audit log entries found
              </p>
            ) : (
              auditLog.map((entry: any) => (
                <Card key={entry.id} className="p-4" data-testid={`audit-entry-${entry.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" data-testid={`badge-action-${entry.action}`}>
                          {entry.action.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{entry.description}</p>
                      {entry.tenantId && (
                        <p className="text-xs text-muted-foreground">
                          Tenant ID: {entry.tenantId}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}