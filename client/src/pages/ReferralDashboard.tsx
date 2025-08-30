import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, DollarSign, Gift, Mail, Plus, Share, Trophy, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Sidebar from "@/components/Sidebar";
import { useUserContext } from "@/context/UserContext";

const referralSchema = z.object({
  referredEmail: z.string().email("Please enter a valid email address"),
  campaignName: z.string().optional(),
});

type ReferralForm = z.infer<typeof referralSchema>;

interface Referral {
  id: string;
  referrerUserId: string;
  referredEmail: string;
  referredUserId?: string;
  referralCode: string;
  status: "pending" | "completed";
  campaignName?: string;
  rewardType: string;
  rewardValue: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReferralReward {
  id: string;
  referralId: string;
  userId: string;
  rewardType: string;
  rewardValue: number;
  rewardDescription: string;
  expiresAt?: string;
  appliedAt?: string;
  appliedToInvoice?: string;
  createdAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  availableRewards: number;
}

export default function ReferralDashboard() {
  const { user } = useUserContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your referral dashboard.",
        variant: "destructive",
      });
      window.location.href = "/api/login";
    }
  }, [user, toast]);

  const form = useForm<ReferralForm>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      campaignName: "Default Campaign",
    },
  });

  const { data: referralData, isLoading } = useQuery({
    queryKey: ["/api/user/referrals"],
    enabled: !!user,
  });

  const createReferralMutation = useMutation({
    mutationFn: async (data: ReferralForm) => {
      return await apiRequest("POST", "/api/user/referrals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/referrals"] });
      setShowCreateForm(false);
      form.reset();
      toast({
        title: "Success",
        description: "Referral link created successfully! Share your link to start earning rewards.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create referral",
        variant: "destructive",
      });
    },
  });

  const referrals: Referral[] = (referralData as any)?.referrals || [];
  const stats: ReferralStats = (referralData as any)?.stats || {
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalRewards: 0,
    availableRewards: 0,
  };
  const rewards: ReferralReward[] = (referralData as any)?.rewards || [];

  const handleCopyReferralLink = (code: string) => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/signup?ref=${code}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied",
      description: "Referral link copied to clipboard",
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Referral code copied to clipboard",
    });
  };

  const onSubmit = (data: ReferralForm) => {
    createReferralMutation.mutate(data);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-80">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Referral Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Share LVL UP with friends and earn rewards together
              </p>
            </div>
            
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-referral">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Referral
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Refer a Friend</DialogTitle>
                  <DialogDescription>
                    Invite someone to join LVL UP and you'll both earn rewards when they sign up
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="referredEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Friend's Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="friend@example.com" 
                              {...field}
                              data-testid="input-friend-email"
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
                          <FormLabel>Campaign Name (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Holiday Promotion" 
                              {...field}
                              data-testid="input-campaign-name"
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
                        disabled={createReferralMutation.isPending}
                        data-testid="button-submit"
                      >
                        {createReferralMutation.isPending ? "Creating..." : "Create Referral"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-referrals">
                  {stats.totalReferrals}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-completed-referrals">
                  {stats.completedReferrals}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-referrals">
                  {stats.pendingReferrals}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-rewards">
                  ${(stats.totalRewards / 100).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-available-rewards">
                  ${(stats.availableRewards / 100).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="referrals" className="space-y-6">
            <TabsList>
              <TabsTrigger value="referrals">My Referrals</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
            </TabsList>

            <TabsContent value="referrals" className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="h-40 animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : referrals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {referrals.map((referral) => (
                    <Card key={referral.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg" data-testid={`text-email-${referral.id}`}>
                            {referral.referredEmail}
                          </CardTitle>
                          <Badge 
                            variant={referral.status === "completed" ? "default" : "secondary"}
                            data-testid={`badge-status-${referral.id}`}
                          >
                            {referral.status}
                          </Badge>
                        </div>
                        <CardDescription data-testid={`text-code-${referral.id}`}>
                          Code: {referral.referralCode}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reward:</span>
                            <span className="font-medium" data-testid={`text-reward-${referral.id}`}>
                              ${(referral.rewardValue / 100).toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span data-testid={`text-created-${referral.id}`}>
                              {format(new Date(referral.createdAt), "MMM dd, yyyy")}
                            </span>
                          </div>

                          {referral.completedAt && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Completed:</span>
                              <span data-testid={`text-completed-${referral.id}`}>
                                {format(new Date(referral.completedAt), "MMM dd, yyyy")}
                              </span>
                            </div>
                          )}

                          {referral.campaignName && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Campaign:</span>
                              <span data-testid={`text-campaign-${referral.id}`}>
                                {referral.campaignName}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyCode(referral.referralCode)}
                            data-testid={`button-copy-code-${referral.id}`}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Code
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyReferralLink(referral.referralCode)}
                            data-testid={`button-copy-link-${referral.id}`}
                          >
                            <Share className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No referrals yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start referring friends to earn rewards together
                    </p>
                    <Button onClick={() => setShowCreateForm(true)} data-testid="button-create-first">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Referral
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="rewards" className="space-y-6">
              {rewards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewards.map((reward) => (
                    <Card key={reward.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg" data-testid={`text-reward-type-${reward.id}`}>
                            {reward.rewardType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </CardTitle>
                          <Badge 
                            variant={reward.appliedAt ? "secondary" : "default"}
                            data-testid={`badge-reward-status-${reward.id}`}
                          >
                            {reward.appliedAt ? "Applied" : "Available"}
                          </Badge>
                        </div>
                        <CardDescription data-testid={`text-reward-description-${reward.id}`}>
                          {reward.rewardDescription}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Value:</span>
                            <span className="font-medium text-green-600" data-testid={`text-reward-value-${reward.id}`}>
                              ${(reward.rewardValue / 100).toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Earned:</span>
                            <span data-testid={`text-reward-created-${reward.id}`}>
                              {format(new Date(reward.createdAt), "MMM dd, yyyy")}
                            </span>
                          </div>

                          {reward.expiresAt && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Expires:</span>
                              <span data-testid={`text-reward-expires-${reward.id}`}>
                                {format(new Date(reward.expiresAt), "MMM dd, yyyy")}
                              </span>
                            </div>
                          )}

                          {reward.appliedAt && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Applied:</span>
                              <span data-testid={`text-reward-applied-${reward.id}`}>
                                {format(new Date(reward.appliedAt), "MMM dd, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>

                        {!reward.appliedAt && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs text-muted-foreground">
                              This reward will be automatically applied to your next invoice
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No rewards yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete referrals to start earning rewards
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}