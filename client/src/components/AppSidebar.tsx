import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  MessageSquare,
  CreditCard,
  Settings,
  ChevronLeft,
  Building2,
  Target,
  UserCheck,
  Calendar,
  FileText,
  Zap,
  ChevronDown,
  LogOut,
  User,
  MoreHorizontal,
  UserPlus,
  Menu,
  X,
  DollarSign,
  Tag,
  Gift,
  Palette,
  Brain,
  TrendingUp,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  user: any;
}

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  badge?: string | number;
  notification?: boolean;
  children?: MenuItem[];
}

function getMenuItemsForRole(role: string, tier?: string): MenuItem[] {
  const baseItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/',
      notification: true
    }
  ];

  switch (role) {
    case 'platform_admin':
      return [
        ...baseItems,
        {
          icon: Building2,
          label: 'Customer Tenants',
          href: '/customer-tenants'
        },
        {
          icon: CreditCard,
          label: 'Billing & Subscriptions',
          href: '/billing'
        },
        {
          icon: DollarSign,
          label: 'Pricing Management',
          href: '/pricing'
        },
        {
          icon: Tag,
          label: 'Discount Codes',
          href: '/discounts'
        },
        {
          icon: BarChart3,
          label: 'Platform Analytics',
          href: '/platform-analytics'
        },
        {
          icon: Settings,
          label: 'System Settings',
          href: '/system-settings'
        },
        {
          icon: MessageSquare,
          label: 'Support Dashboard',
          href: '/support-dashboard'
        }
      ];

    case 'tenant_admin':
      return [
        ...baseItems,
        {
          icon: Building2,
          label: 'Organization Chart',
          href: '/org-chart'
        },
        {
          icon: Users,
          label: 'Employee Management',
          href: '/employees',
          badge: '127'
        },
        {
          icon: BarChart3,
          label: 'Performance Management',
          href: '/performance',
          badge: 'New'
        },
        {
          icon: MessageSquare,
          label: 'Feedback Analytics',
          href: '/feedback-analytics',
          badge: '847'
        },
        {
          icon: CreditCard,
          label: 'Account Billing',
          href: '/billing'
        },
        {
          icon: Settings,
          label: 'Company Settings',
          href: '/settings'
        },
        {
          icon: Zap,
          label: 'Integration Setup',
          href: '/integrations',
          notification: true
        },
        {
          icon: Palette,
          label: 'Website Customization',
          href: '/website-customization'
        },
        {
          icon: Brain,
          label: 'AI Insights',
          href: '/ai-insights',
          badge: tier && ['norming', 'performing', 'appsumo'].includes(tier.toLowerCase()) ? 'Premium' : 'Upgrade'
        }
      ];

    case 'manager':
      return [
        ...baseItems,
        {
          icon: Users,
          label: 'My Team',
          href: '/team'
        },
        {
          icon: FileText,
          label: 'Performance Reviews',
          href: '/reviews'
        },
        {
          icon: Target,
          label: 'Goal Management',
          href: '/goals'
        },
        {
          icon: MessageSquare,
          label: 'Feedback Center',
          href: '/feedback'
        },
        {
          icon: BarChart3,
          label: 'Team Analytics',
          href: '/team-analytics'
        },
        {
          icon: Calendar,
          label: '1:1 Meetings',
          href: '/meetings'
        },
        {
          icon: Brain,
          label: 'AI Insights',
          href: '/ai-insights',
          badge: tier && ['norming', 'performing', 'appsumo'].includes(tier.toLowerCase()) ? 'Premium' : 'Upgrade'
        }
      ];

    case 'employee':
    default:
      return [
        ...baseItems,
        {
          icon: BarChart3,
          label: 'My Performance',
          href: '/performance'
        },
        {
          icon: MessageSquare,
          label: 'Feedback Collection',
          href: '/feedback-collection'
        },
        {
          icon: Gift,
          label: 'Peer Feedback',
          href: '/peer-feedback'
        },
        {
          icon: User,
          label: 'Profile Settings',
          href: '/profile'
        },
        {
          icon: Gift,
          label: 'Referral Program',
          href: '/referrals'
        }
      ];
  }
}

function getTierDisplayName(tier: string | null | undefined): string {
  if (!tier) return 'Basic';
  
  switch (tier.toLowerCase()) {
    case 'mj_scott': return 'MJ Scott';
    case 'forming': return 'Forming';
    case 'storming': return 'Storming';
    case 'norming': return 'Norming';
    case 'performing': return 'Performing';
    case 'appsumo': return 'AppSumo';
    default: return tier;
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const [location] = useLocation();
  const { state, isMobile } = useSidebar();
  
  const role = user?.role || 'employee';
  const tier = user?.employee?.tenant?.subscriptionTier;
  const menuItems = getMenuItemsForRole(role, tier);
  
  const isPremiumTier = tier && ['norming', 'performing', 'appsumo'].includes(tier.toLowerCase());

  return (
    <Sidebar 
      variant="inset" 
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="border-r border-sidebar-border"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-sidebar-primary-foreground">
                <TrendingUp className="size-4 text-white" />
              </div>
              {state === "expanded" && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">LVL UP Performance</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">HR Platform</span>
                </div>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex-1 px-2">
        {/* User Tenant Info */}
        {user?.tenant && state === "expanded" && (
          <div className="px-3 py-4 border-b border-sidebar-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm truncate">
                  {user.tenant.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-medium",
                    isPremiumTier ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200" : "bg-muted"
                  )}
                >
                  {getTierDisplayName(tier)}
                </Badge>
              </div>
              {isPremiumTier && (
                <Badge className="w-full justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Premium Features Active
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <SidebarMenu className="space-y-1 p-2">
          {menuItems.map((item, index) => {
            const isActive = location === item.href;
            
            return (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  className={cn(
                    "w-full justify-start h-10 px-3",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                  data-testid={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Link href={item.href || '#'}>
                    <item.icon className="size-4 shrink-0" />
                    <span className="ml-3 truncate">{item.label}</span>
                    {(item.badge || item.notification) && (
                      <div className="ml-auto flex items-center gap-1">
                        {item.badge && (
                          <Badge 
                            variant={typeof item.badge === 'string' ? 'secondary' : 'outline'}
                            className={cn(
                              "text-xs h-5 px-1.5",
                              typeof item.badge === 'string' && item.badge === 'New' && "bg-primary/10 text-primary",
                              typeof item.badge === 'string' && item.badge === 'Premium' && "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700",
                              typeof item.badge === 'string' && item.badge === 'Upgrade' && "bg-orange-100 text-orange-700"
                            )}
                            data-testid={`badge-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.notification && (
                          <div className="size-2 bg-primary rounded-full animate-pulse" />
                        )}
                      </div>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full justify-start h-12 px-3" data-testid="user-profile-section">
                    <Avatar className="size-8 border">
                      <AvatarImage 
                        src={user.profileImageUrl || ''} 
                        alt={`${user.firstName || ''} ${user.lastName || ''}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {state === "expanded" && (
                      <>
                        <div className="flex flex-col flex-1 text-left ml-3 min-w-0">
                          <span className="text-sm font-medium truncate" data-testid="text-user-name">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-sidebar-foreground/70 capitalize truncate" data-testid="text-user-role-profile">
                            {user.role?.replace('_', ' ')}
                          </span>
                        </div>
                        <ChevronDown className="size-4 text-sidebar-foreground/50" />
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="right" 
                  align="end" 
                  className="w-56" 
                  data-testid="user-dropdown-menu"
                >
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer" data-testid="dropdown-profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600" 
                    onClick={() => window.location.href = '/api/logout'}
                    data-testid="dropdown-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}