import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, QrCode, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface FeedbackSystemProps {
  user: any;
}

export default function FeedbackSystem({ user }: FeedbackSystemProps) {
  const { toast } = useToast();
  
  // Get a sample employee from the tenant to showcase the feedback system
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees', user.tenant?.id],
    enabled: !!user.tenant?.id,
  });
  
  // Get dashboard metrics for feedback statistics
  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard/metrics', user.tenant?.id],
    enabled: !!user.tenant?.id,
  });
  
  // Pick the first employee as sample (could be random or most recent)
  const sampleEmployee = employees[0];

  const handleCopyFeedbackLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Feedback link has been copied to clipboard",
    });
  };

  return (
    <Card className="glass-card border-0" data-testid="card-feedback-system">
      <CardHeader>
        <CardTitle>Universal Feedback System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Real Employee Feedback Profile */}
        {employeesLoading ? (
          <div className="animate-pulse bg-gray-100 p-4 rounded-xl border">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ) : sampleEmployee ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100" data-testid="feedback-profile-sample">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage 
                  src={sampleEmployee.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sampleEmployee.id}`}
                  alt={`${sampleEmployee.firstName} ${sampleEmployee.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback>
                  {sampleEmployee.firstName?.charAt(0)}{sampleEmployee.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-blue-900" data-testid="text-sample-employee-name">
                  {sampleEmployee.firstName} {sampleEmployee.lastName}
                </p>
                <p className="text-sm text-blue-700" data-testid="text-sample-employee-role">
                  {sampleEmployee.email?.includes('admin') ? 'Tenant Admin' : 
                   sampleEmployee.email?.includes('manager') ? 'Manager' : 'Team Member'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-blue-700 mb-2">Personal Feedback URL</p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white rounded-lg text-xs font-mono" data-testid="code-feedback-url">
                    {sampleEmployee.feedbackUrl ? `fbk.${user.tenant?.domain || 'company'}.com/${sampleEmployee.feedbackUrl}` : 'Generating URL...'}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopyFeedbackLink(sampleEmployee.feedbackUrl ? `fbk.${user.tenant?.domain || 'company'}.com/${sampleEmployee.feedbackUrl}` : '')}
                    className="hover:bg-white/50"
                    data-testid="button-copy-feedback-url"
                    disabled={!sampleEmployee.feedbackUrl}
                  >
                    <Copy className="w-4 h-4 text-blue-600" />
                  </Button>
                </div>
              </div>
              
              {/* QR Code and Stats */}
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white p-2 rounded-lg border-2 border-blue-200 mb-2" data-testid="qr-code-display">
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-blue-700">QR Code</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-2">
                    <span className="text-xl font-bold text-green-600" data-testid="text-performance-score">
                      {metrics?.avgPerformance || 85}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">Score</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-2">
                    <span className="text-xl font-bold text-purple-600" data-testid="text-review-count">
                      {metrics?.totalFeedback || 0}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">Reviews</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-xl border text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No employees available to showcase</p>
          </div>
        )}

        {/* Real Feedback Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100" data-testid="stat-total-feedback">
            <p className="text-2xl font-bold text-green-600">{metrics?.totalEmployees || 0}</p>
            <p className="text-sm text-green-700">Active Employees</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100" data-testid="stat-avg-rating">
            <p className="text-2xl font-bold text-blue-600">{((metrics?.avgPerformance || 85) / 100 * 5).toFixed(1)}</p>
            <p className="text-sm text-blue-700">Avg Rating</p>
          </div>
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 font-medium"
          data-testid="button-generate-feedback-links"
        >
          Generate New Feedback Links
        </Button>
      </CardContent>
    </Card>
  );
}
