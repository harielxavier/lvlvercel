import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
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
          href: '/tenants'
        },
        {
          icon: CreditCard,
          label: 'Billing & Subscriptions',
          href: '/billing'
        },
        {
          icon: BarChart3,
          label: 'Platform Analytics',
          href: '/analytics'
        },
        {
          icon: Settings,
          label: 'System Settings',
          href: '/system-settings'
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
          label: 'Billing & Subscription',
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
          icon: Target,
          label: 'Goals & Development',
          href: '/goals'
        },
        {
          icon: UserCheck,
          label: 'Peer Feedback',
          href: '/peer-feedback'
        },
        {
          icon: Settings,
          label: 'Profile Settings',
          href: '/profile'
        }
      ];
  }
}

function getTierDisplayName(tier?: string): string {
  switch (tier) {
    case 'mj_scott': return 'MJ Scott';
    case 'forming': return 'Forming';
    case 'storming': return 'Storming';
    case 'norming': return 'Norming';
    case 'performing': return 'Performing';
    case 'appsumo': return 'AppSumo';
    default: return 'Free';
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  
  const menuItems = getMenuItemsForRole(user.role, user.tenant?.subscriptionTier);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full glass-morphism transform transition-all duration-300 ease-in-out z-50 border-r",
        isCollapsed ? "w-16" : "w-80"
      )}
      data-testid="sidebar-main"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-sidebar-foreground">LVL UP</h3>
                  <p className="text-xs text-muted-foreground">Performance</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hover:bg-sidebar-accent"
              data-testid="button-toggle-sidebar"
            >
              <ChevronLeft className={cn("w-5 h-5 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          </div>
          
          {/* Tenant & Role Info */}
          {!isCollapsed && user.tenant && (
            <div className="mt-4 p-3 bg-sidebar-accent rounded-xl border border-sidebar-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-sidebar-foreground" data-testid="text-tenant-name">
                    {user.tenant.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize" data-testid="text-user-role">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
                <Badge 
                  className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium"
                  data-testid="badge-subscription-tier"
                >
                  {getTierDisplayName(user.tenant.subscriptionTier)}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1" data-testid="nav-sidebar">
          {menuItems.map((item, index) => {
            const isActive = location === item.href;
            
            return (
              <Link key={index} href={item.href || '#'}>
                <div
                  className={cn(
                    "sidebar-item flex items-center space-x-3 px-3 py-3 rounded-xl cursor-pointer",
                    isActive && "active",
                    isCollapsed && "justify-center"
                  )}
                  data-testid={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "")} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      <div className="ml-auto flex items-center space-x-2">
                        {item.badge && (
                          <Badge 
                            variant={typeof item.badge === 'string' ? 'secondary' : 'outline'}
                            className={cn(
                              "text-xs font-medium",
                              typeof item.badge === 'string' && item.badge === 'New' && "bg-primary/10 text-primary"
                            )}
                            data-testid={`badge-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.notification && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" data-testid={`notification-${item.label.toLowerCase().replace(/\s+/g, '-')}`}></div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div 
            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-sidebar-accent cursor-pointer transition-colors"
            data-testid="user-profile-section"
          >
            <Avatar className="w-10 h-10 border-2 border-sidebar-border">
              <AvatarImage 
                src={user.profileImageUrl} 
                alt={`${user.firstName} ${user.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <div className="flex-1">
                  <p className="font-medium text-sm" data-testid="text-user-name">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize" data-testid="text-user-role-profile">
                    {user.role?.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
