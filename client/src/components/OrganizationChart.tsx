import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface OrganizationChartProps {
  user: any;
}

export default function OrganizationChart({ user }: OrganizationChartProps) {
  return (
    <Card className="glass-card border-0" data-testid="card-organization-structure">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Organization Structure</CardTitle>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-view-full-chart">
            View Full Chart
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CEO Level */}
        <div className="flex items-center justify-center" data-testid="org-ceo-level">
          <div className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-2 border-4 border-blue-200">
              <AvatarImage 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400" 
                alt="Robert Chen" 
                className="object-cover"
              />
              <AvatarFallback>RC</AvatarFallback>
            </Avatar>
            <p className="font-semibold text-sm" data-testid="text-ceo-name">Robert Chen</p>
            <p className="text-xs text-muted-foreground" data-testid="text-ceo-role">CEO</p>
          </div>
        </div>
        
        {/* Department Heads */}
        <div className="flex justify-center space-x-8" data-testid="org-department-heads">
          <div className="text-center" data-testid="department-tech">
            <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-green-200">
              <AvatarImage 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400" 
                alt="Tech Team Lead" 
                className="object-cover"
              />
              <AvatarFallback>TT</AvatarFallback>
            </Avatar>
            <p className="font-medium text-xs">Tech Team</p>
            <p className="text-xs text-muted-foreground">45 members</p>
          </div>
          
          <div className="text-center" data-testid="department-sales">
            <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-purple-200">
              <AvatarImage 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&h=400" 
                alt="Sales Director" 
                className="object-cover"
              />
              <AvatarFallback>SD</AvatarFallback>
            </Avatar>
            <p className="font-medium text-xs">Sales Team</p>
            <p className="text-xs text-muted-foreground">32 members</p>
          </div>
          
          <div className="text-center" data-testid="department-marketing">
            <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-orange-200">
              <AvatarImage 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400" 
                alt="Marketing Director" 
                className="object-cover"
              />
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <p className="font-medium text-xs">Marketing</p>
            <p className="text-xs text-muted-foreground">28 members</p>
          </div>
          
          <div className="text-center" data-testid="department-hr">
            <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-pink-200">
              <AvatarImage 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400" 
                alt="HR Director" 
                className="object-cover"
              />
              <AvatarFallback>HR</AvatarFallback>
            </Avatar>
            <p className="font-medium text-xs">HR Team</p>
            <p className="text-xs text-muted-foreground">22 members</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
