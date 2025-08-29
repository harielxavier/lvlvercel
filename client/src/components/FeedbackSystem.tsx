import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackSystemProps {
  user: any;
}

export default function FeedbackSystem({ user }: FeedbackSystemProps) {
  const { toast } = useToast();

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
        {/* Sample Employee Feedback Profile */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100" data-testid="feedback-profile-sample">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400" 
                alt="John Doe" 
                className="object-cover"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-blue-900" data-testid="text-sample-employee-name">John Doe</p>
              <p className="text-sm text-blue-700" data-testid="text-sample-employee-role">Product Manager</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-blue-700 mb-2">Personal Feedback URL</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-3 py-2 bg-white rounded-lg text-xs font-mono" data-testid="code-feedback-url">
                  fbk.techcorp.io/john-x7k9
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleCopyFeedbackLink('fbk.techcorp.io/john-x7k9')}
                  className="hover:bg-white/50"
                  data-testid="button-copy-feedback-url"
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
                  <span className="text-xl font-bold text-green-600" data-testid="text-performance-score">92</span>
                </div>
                <p className="text-xs text-blue-700">Score</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-purple-600" data-testid="text-review-count">47</span>
                </div>
                <p className="text-xs text-blue-700">Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100" data-testid="stat-total-feedback">
            <p className="text-2xl font-bold text-green-600">847</p>
            <p className="text-sm text-green-700">Total Feedback</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100" data-testid="stat-avg-rating">
            <p className="text-2xl font-bold text-blue-600">4.6</p>
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
