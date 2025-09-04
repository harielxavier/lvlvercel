import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AppLayoutProps {
  user: any;
  children: React.ReactNode;
}

export default function AppLayout({ user, children }: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar user={user} />
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between p-4 border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
            <SidebarTrigger className="mr-2">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <h1 className="font-bold text-lg">LVL UP Performance</h1>
            <div className="w-6"></div> {/* Spacer for centering */}
          </div>
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}