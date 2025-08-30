import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Gift
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
          icon: Gift,
          label: 'Referral Dashboard',
          href: '/referrals'
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [location] = useLocation();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);
  
  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };
    
    if (isMobileOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileOpen]);
  
  const menuItems = user ? getMenuItemsForRole(user.role, user.tenant?.subscriptionTier) : [];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-md bg-background/80 backdrop-blur-sm border border-border shadow-lg"
        data-testid="mobile-menu-button"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
          data-testid="mobile-overlay"
        />
      )}
      
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full glass-morphism transform transition-all duration-300 ease-in-out z-50 border-r",
          // Desktop behavior
          "lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "lg:w-80",
          // Mobile behavior  
          "lg:block",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "w-80"
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
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-sidebar-foreground">LVL UP</h3>
                  <p className="text-xs text-muted-foreground">Performance</p>
                </div>
                
                {/* Development User Switcher */}
                {import.meta.env.DEV && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-8 h-8 p-0 hover:bg-sidebar-accent"
                        data-testid="dev-user-switcher"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" data-testid="dev-switcher-menu">
                      <DropdownMenuItem 
                        className="cursor-pointer" 
                        onClick={() => window.open('/api/login', '_blank')}
                        data-testid="dev-login-as-user"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Login as User</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" data-testid="user-dropdown-menu">
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
        </div>
      </div>
    </aside>
    </>
  );
}
