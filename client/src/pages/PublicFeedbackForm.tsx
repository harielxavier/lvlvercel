import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Star, Send, Heart, Building2, User, Mail } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  profileImageUrl?: string;
  feedbackUrl: string;
}

interface Tenant {
  id: string;
  name: string;
  domain: string;
}

interface FeedbackData {
  giverName: string;
  giverEmail: string;
  relationship: string;
  rating: number;
  competencyScores: Record<string, number>;
  comments: string;
  isAnonymous: boolean;
}

const competencies = [
  'Communication',
  'Leadership',
  'Problem Solving',
  'Teamwork',
  'Technical Skills',
  'Customer Service',
  'Innovation',
  'Time Management'
];

const relationships = [
  'client',
  'colleague',
  'manager',
  'direct_report',
  'vendor',
  'partner',
  'other'
];

export default function PublicFeedbackForm() {
  const [, params] = useRoute('/feedback/:feedbackUrl');
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [competencyRatings, setCompetencyRatings] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: employeeData, isLoading, error } = useQuery({
    queryKey: [`/feedback/${params?.feedbackUrl}`],
    queryFn: async () => {
      const response = await fetch(`/feedback/${params?.feedbackUrl}`);
      if (!response.ok) {
        throw new Error('Feedback link not found');
      }
      return response.json() as Promise<{ employee: Employee; tenant: Tenant }>;
    },
    enabled: !!params?.feedbackUrl
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: FeedbackData) => {
      const response = await fetch(`/feedback/${params?.feedbackUrl}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your valuable feedback.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      console.error('Error submitting feedback:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const feedbackData: FeedbackData = {
      giverName: formData.get('giverName') as string,
      giverEmail: formData.get('giverEmail') as string,
      relationship: formData.get('relationship') as string,
      rating,
      competencyScores: competencyRatings,
      comments: formData.get('comments') as string,
      isAnonymous: formData.get('isAnonymous') === 'on'
    };

    submitFeedbackMutation.mutate(feedbackData);
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleCompetencyRating = (competency: string, competencyRating: number) => {
    setCompetencyRatings(prev => ({
      ...prev,
      [competency]: competencyRating
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4 glass-card border-0">
          <CardContent className="p-8">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4 glass-card border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <User className="w-16 h-16 mx-auto text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Feedback Link Not Found</h2>
            <p className="text-gray-600">
              The feedback link you're looking for doesn't exist or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md mx-4 glass-card border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Heart className="w-16 h-16 mx-auto text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
            <p className="text-green-600 mb-4">
              Your feedback has been submitted successfully.
            </p>
            <p className="text-sm text-green-500">
              {employeeData.employee.firstName} will appreciate your valuable input.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { employee, tenant } = employeeData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" data-testid="page-public-feedback">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {tenant.name}
            </h1>
          </div>
          <p className="text-gray-600">Performance Feedback System</p>
        </div>

        {/* Employee Profile */}
        <Card className="glass-card border-0 mb-8" data-testid="card-employee-profile">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={employee.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`}
                  alt={`${employee.firstName} ${employee.lastName}`}
                />
                <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-800">
                  {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-800" data-testid="text-employee-name">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-gray-600 font-medium" data-testid="text-employee-title">
                  {employee.jobTitle}
                </p>
                <Badge variant="outline" className="mt-1">
                  {employee.department}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Please share your feedback about {employee.firstName}'s performance and collaboration.
              Your input helps them grow and improve.
            </p>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <Card className="glass-card border-0" data-testid="card-feedback-form">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2 text-blue-600" />
              Share Your Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-feedback">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="giverName">Your Name</Label>
                  <Input 
                    id="giverName" 
                    name="giverName" 
                    placeholder="Enter your full name" 
                    required
                    data-testid="input-giver-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="giverEmail">Email Address</Label>
                  <Input 
                    id="giverEmail" 
                    name="giverEmail" 
                    type="email" 
                    placeholder="your.email@company.com"
                    data-testid="input-giver-email"
                  />
                </div>
              </div>

              {/* Relationship */}
              <div className="space-y-2">
                <Label htmlFor="relationship">Your Relationship</Label>
                <Select name="relationship" required>
                  <SelectTrigger data-testid="select-relationship">
                    <SelectValue placeholder="Select your working relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map(rel => (
                      <SelectItem key={rel} value={rel}>
                        {rel.charAt(0).toUpperCase() + rel.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Overall Rating */}
              <div className="space-y-3">
                <Label>Overall Performance Rating</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      className="text-3xl focus:outline-none hover:scale-110 transition-transform"
                      data-testid={`star-${star}`}
                    >
                      <Star 
                        className={`w-8 h-8 ${star <= rating 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-medium text-gray-700">
                    {rating} out of 5
                  </span>
                </div>
              </div>

              {/* Competency Ratings */}
              <div className="space-y-4">
                <Label>Competency Ratings (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {competencies.map(competency => (
                    <div key={competency} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">{competency}</span>
                        <span className="text-sm text-gray-500">
                          {competencyRatings[competency] || 'Not rated'}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={`${competency}-${rating}`}
                            type="button"
                            onClick={() => handleCompetencyRating(competency, rating)}
                            className="focus:outline-none hover:scale-110 transition-transform"
                            data-testid={`competency-${competency.toLowerCase().replace(' ', '-')}-${rating}`}
                          >
                            <Star 
                              className={`w-5 h-5 ${
                                rating <= (competencyRatings[competency] || 0)
                                  ? 'text-blue-400 fill-blue-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments</Label>
                <Textarea 
                  id="comments"
                  name="comments"
                  placeholder="Share specific examples of their strengths, areas for improvement, or memorable interactions..."
                  rows={5}
                  data-testid="textarea-comments"
                />
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center space-x-2">
                <Switch id="isAnonymous" name="isAnonymous" data-testid="switch-anonymous" />
                <Label htmlFor="isAnonymous" className="text-sm">
                  Submit this feedback anonymously
                </Label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={submitFeedbackMutation.isPending}
                data-testid="button-submit-feedback"
              >
                {submitFeedbackMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Submit Feedback
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by LVL UP Performance • Secure & Confidential</p>
        </div>
      </div>
    </div>
  );
}