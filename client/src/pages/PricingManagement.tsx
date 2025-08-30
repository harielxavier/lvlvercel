import { useState } from "react";
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
import { Plus, Edit, Trash2, DollarSign, Users, Star, Eye, History } from "lucide-react";
import { z } from "zod";

const pricingTierFormSchema = insertPricingTierSchema.extend({
  features: z.array(z.string()).min(1, "At least one feature is required"),
});

type PricingTierFormData = z.infer<typeof pricingTierFormSchema>;

export default function PricingManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTier, setDeletingTier] = useState<PricingTier | null>(null);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [featuresInput, setFeaturesInput] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pricing Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage subscription tiers, pricing, and features for your platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAuditDialogOpen(true)}
              data-testid="button-view-audit-log"
            >
              <History className="w-4 h-4 mr-2" />
              Audit Log
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="button-create-tier"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Tier
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pricingTiers.map((tier: PricingTier) => (
          <Card key={tier.id} className="relative" data-testid={`card-pricing-tier-${tier.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {tier.name}
                    {!tier.isActive && (
                      <Badge variant="secondary" data-testid={`badge-inactive-${tier.id}`}>
                        Inactive
                      </Badge>
                    )}
                  </CardTitle>
                  {tier.description && (
                    <CardDescription>{tier.description}</CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTier(tier)}
                    data-testid={`button-edit-${tier.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTier(tier)}
                    data-testid={`button-delete-${tier.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  Monthly
                </div>
                <div className="font-semibold" data-testid={`text-monthly-price-${tier.id}`}>
                  {formatPrice(tier.monthlyPrice)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  Yearly
                </div>
                <div className="font-semibold" data-testid={`text-yearly-price-${tier.id}`}>
                  {formatPrice(tier.yearlyPrice)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  Max Seats
                </div>
                <div className="font-semibold" data-testid={`text-max-seats-${tier.id}`}>
                  {tier.maxSeats === -1 ? "Unlimited" : tier.maxSeats}
                </div>
              </div>

              {tier.targetMarket && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4" />
                    Target Market
                  </div>
                  <div className="text-sm" data-testid={`text-target-market-${tier.id}`}>
                    {tier.targetMarket}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <div className="text-sm font-medium mb-2">Features:</div>
                <div className="space-y-1">
                  {(tier.features as string[]).slice(0, 3).map((feature, index) => (
                    <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                  {(tier.features as string[]).length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{(tier.features as string[]).length - 3} more features
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
  );
}