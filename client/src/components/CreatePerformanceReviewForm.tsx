import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Star, Plus, Save, X } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

const competencies = [
  'Communication',
  'Leadership',
  'Problem Solving',
  'Teamwork',
  'Technical Skills',
  'Customer Service',
  'Innovation',
  'Time Management',
  'Adaptability',
  'Quality of Work'
];

const createReviewSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee"),
  reviewerId: z.string().min(1, "Reviewer ID is required"),
  reviewPeriod: z.string().min(1, "Review period is required"),
  overallScore: z.coerce.number().min(0).max(5).optional(),
  competencyScores: z.record(z.number().min(0).max(5)).optional(),
  comments: z.string().optional(),
  goals: z.array(z.object({
    title: z.string(),
    description: z.string(),
    targetDate: z.string(),
    progress: z.number().min(0).max(100)
  })).optional(),
  status: z.enum(['draft', 'submitted', 'approved']).default('draft'),
});

type CreateReviewFormData = z.infer<typeof createReviewSchema>;

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  profileImageUrl?: string;
}

interface CreatePerformanceReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  reviewerId: string;
  editReview?: any;
}

export default function CreatePerformanceReviewForm({ 
  isOpen, 
  onClose, 
  tenantId, 
  reviewerId,
  editReview 
}: CreatePerformanceReviewFormProps) {
  const { toast } = useToast();
  const [competencyRatings, setCompetencyRatings] = useState<Record<string, number>>({});
  const [goals, setGoals] = useState([{ title: '', description: '', targetDate: '', progress: 0 }]);

  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees', tenantId],
    enabled: !!tenantId && isOpen,
  });

  const form = useForm<CreateReviewFormData>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      employeeId: editReview?.employeeId || '',
      reviewerId: reviewerId,
      reviewPeriod: editReview?.reviewPeriod || '',
      overallScore: editReview?.overallScore || 0,
      competencyScores: editReview?.competencyScores || {},
      comments: editReview?.comments || '',
      goals: editReview?.goals || [],
      status: editReview?.status || 'draft',
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: CreateReviewFormData) => {
      const endpoint = editReview 
        ? `/api/performance-review/${editReview.id}`
        : '/api/performance-reviews';
      const method = editReview ? 'PUT' : 'POST';
      
      return apiRequest(method, endpoint, {
        ...data,
        competencyScores: competencyRatings,
        goals: goals.filter(goal => goal.title.trim() !== ''),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/performance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employee'] });
      toast({
        title: editReview ? "Review Updated!" : "Review Created!",
        description: editReview 
          ? "Performance review has been updated successfully." 
          : "Performance review has been created successfully.",
      });
      onClose();
      form.reset();
      setCompetencyRatings({});
      setGoals([{ title: '', description: '', targetDate: '', progress: 0 }]);
    },
    onError: (error) => {
      console.error('Error with performance review:', error);
      toast({
        title: "Error",
        description: editReview 
          ? "Failed to update performance review. Please try again." 
          : "Failed to create performance review. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: CreateReviewFormData) => {
    createReviewMutation.mutate(data);
  };

  const handleCompetencyRating = (competency: string, rating: number) => {
    setCompetencyRatings(prev => ({
      ...prev,
      [competency]: rating
    }));
  };

  const addGoal = () => {
    setGoals(prev => [...prev, { title: '', description: '', targetDate: '', progress: 0 }]);
  };

  const updateGoal = (index: number, field: string, value: string | number) => {
    setGoals(prev => prev.map((goal, i) => 
      i === index ? { ...goal, [field]: value } : goal
    ));
  };

  const removeGoal = (index: number) => {
    setGoals(prev => prev.filter((_, i) => i !== index));
  };

  const selectedEmployee = employees.find((emp: Employee) => emp.id === form.watch('employeeId'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create-review">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Save className="w-5 h-5 mr-2" />
            {editReview ? 'Edit Performance Review' : 'Create Performance Review'}
          </DialogTitle>
          <DialogDescription>
            {editReview 
              ? 'Update the performance review details below.'
              : 'Create a comprehensive performance review for your team member.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employeeId">Select Employee</Label>
            <Select 
              value={form.watch('employeeId')} 
              onValueChange={(value) => form.setValue('employeeId', value)}
              disabled={!!editReview}
            >
              <SelectTrigger data-testid="select-employee">
                <SelectValue placeholder="Choose an employee to review" />
              </SelectTrigger>
              <SelectContent>
                {employeesLoading ? (
                  <SelectItem value="loading" disabled>Loading employees...</SelectItem>
                ) : (
                  employees.map((employee: Employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage 
                            src={employee.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`}
                            alt={`${employee.firstName} ${employee.lastName}`}
                          />
                          <AvatarFallback className="text-xs">
                            {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">{employee.firstName} {employee.lastName}</span>
                          <span className="text-sm text-muted-foreground ml-2">{employee.jobTitle}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.employeeId && (
              <p className="text-sm text-red-500">{form.formState.errors.employeeId.message}</p>
            )}
          </div>

          {/* Selected Employee Preview */}
          {selectedEmployee && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 border-2 border-blue-300">
                  <AvatarImage 
                    src={selectedEmployee.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedEmployee.id}`}
                    alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                  />
                  <AvatarFallback>
                    {selectedEmployee.firstName?.charAt(0)}{selectedEmployee.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-blue-800">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-blue-600">{selectedEmployee.jobTitle}</p>
                  <Badge variant="outline" className="mt-1">{selectedEmployee.department}</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Review Period */}
          <div className="space-y-2">
            <Label htmlFor="reviewPeriod">Review Period</Label>
            <Input
              id="reviewPeriod"
              placeholder="e.g., Q1 2024, Annual 2024, Mid-Year Review"
              {...form.register('reviewPeriod')}
              data-testid="input-review-period"
            />
            {form.formState.errors.reviewPeriod && (
              <p className="text-sm text-red-500">{form.formState.errors.reviewPeriod.message}</p>
            )}
          </div>

          {/* Overall Rating */}
          <div className="space-y-3">
            <Label>Overall Performance Rating</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => form.setValue('overallScore', rating)}
                  className="text-2xl focus:outline-none hover:scale-110 transition-transform"
                  data-testid={`overall-rating-${rating}`}
                >
                  <Star 
                    className={`w-8 h-8 ${rating <= (form.watch('overallScore') || 0)
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                    }`} 
                  />
                </button>
              ))}
              <span className="ml-3 text-lg font-medium">
                {form.watch('overallScore') || 0} out of 5
              </span>
            </div>
          </div>

          {/* Competency Ratings */}
          <div className="space-y-4">
            <Label>Competency Ratings</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competencies.map((competency) => (
                <div key={competency} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{competency}</span>
                    <span className="text-sm text-muted-foreground">
                      {competencyRatings[competency] || 'Not rated'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
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
            <Label htmlFor="comments">Review Comments</Label>
            <Textarea
              id="comments"
              placeholder="Provide detailed feedback about the employee's performance, achievements, and areas for improvement..."
              rows={5}
              {...form.register('comments')}
              data-testid="textarea-comments"
            />
          </div>

          {/* Goals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Performance Goals</Label>
              <Button type="button" variant="outline" size="sm" onClick={addGoal}>
                <Plus className="w-4 h-4 mr-1" />
                Add Goal
              </Button>
            </div>
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Goal {index + 1}</h4>
                    {goals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGoal(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Goal Title</Label>
                      <Input
                        placeholder="e.g., Improve customer satisfaction scores"
                        value={goal.title}
                        onChange={(e) => updateGoal(index, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={goal.targetDate}
                        onChange={(e) => updateGoal(index, 'targetDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the goal in detail and success criteria..."
                      rows={2}
                      value={goal.description}
                      onChange={(e) => updateGoal(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Review Status</Label>
            <Select 
              value={form.watch('status')} 
              onValueChange={(value) => form.setValue('status', value as 'draft' | 'submitted' | 'approved')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createReviewMutation.isPending}
              data-testid="button-save-review"
            >
              {createReviewMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editReview ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {editReview ? 'Update Review' : 'Create Review'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}