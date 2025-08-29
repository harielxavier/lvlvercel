import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { UserContextProvider } from "@/context/UserContext";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import CustomerTenants from "@/pages/CustomerTenants";
import PlatformAnalytics from "@/pages/PlatformAnalytics";
import BillingSubscriptions from "@/pages/BillingSubscriptions";
import SystemSettings from "@/pages/SystemSettings";
import OrganizationChart from "@/pages/OrganizationChart";
import EmployeeManagement from "@/pages/EmployeeManagement";
import Performance from "@/pages/Performance";
import FeedbackAnalytics from "@/pages/FeedbackAnalytics";
import Settings from "@/pages/Settings";
import Integrations from "@/pages/Integrations";
import Team from "@/pages/Team";
import Reviews from "@/pages/Reviews";
import Goals from "@/pages/Goals";
import Feedback from "@/pages/Feedback";
import TeamAnalytics from "@/pages/TeamAnalytics";
import Meetings from "@/pages/Meetings";
import FeedbackCollection from "@/pages/FeedbackCollection";
import PeerFeedback from "@/pages/PeerFeedback";
import Profile from "@/pages/Profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    window.location.href = '/api/login';
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-8 rounded-2xl">
          <p className="text-lg font-medium mb-2">Redirecting to login...</p>
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-4 w-4"></div>
            <div className="rounded-full bg-slate-200 h-4 w-4"></div>
            <div className="rounded-full bg-slate-200 h-4 w-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Home} />
      
      {/* Platform Admin Routes */}
      <Route path="/tenants" component={CustomerTenants} />
      <Route path="/analytics" component={PlatformAnalytics} />
      <Route path="/billing" component={BillingSubscriptions} />
      <Route path="/system-settings" component={SystemSettings} />
      
      {/* Tenant Admin Routes */}
      <Route path="/org-chart" component={OrganizationChart} />
      <Route path="/employees" component={EmployeeManagement} />
      <Route path="/performance" component={Performance} />
      <Route path="/feedback-analytics" component={FeedbackAnalytics} />
      <Route path="/settings" component={Settings} />
      <Route path="/integrations" component={Integrations} />
      
      {/* Manager Routes */}
      <Route path="/team" component={Team} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/goals" component={Goals} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/team-analytics" component={TeamAnalytics} />
      <Route path="/meetings" component={Meetings} />
      
      {/* Employee Routes */}
      <Route path="/feedback-collection" component={FeedbackCollection} />
      <Route path="/peer-feedback" component={PeerFeedback} />
      <Route path="/profile" component={Profile} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserContextProvider>
          <Toaster />
          <Router />
        </UserContextProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
