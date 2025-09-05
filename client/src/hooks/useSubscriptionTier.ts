import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface TierFeatures {
  // Core Features
  basicEmployeeManagement: boolean;
  basicDashboard: boolean;
  employeeProfiles: boolean;
  
  // Employee Management
  maxEmployees: number | null;
  bulkEmployeeOperations: boolean;
  advancedEmployeeSearch: boolean;
  departmentManagement: boolean;
  jobPositionManagement: boolean;
  employeeHierarchy: boolean;
  
  // Performance & Reviews
  performanceReviews: boolean;
  advancedPerformanceMetrics: boolean;
  customPerformanceCriteria: boolean;
  
  // Feedback System
  basicFeedback: boolean;
  qrCodeFeedback: boolean;
  advancedFeedbackAnalytics: boolean;
  realTimeFeedbackAlerts: boolean;
  
  // Goals & Development
  goalTracking: boolean;
  advancedGoalAnalytics: boolean;
  personalDevelopmentPlans: boolean;
  
  // Analytics & Reporting
  basicReporting: boolean;
  advancedAnalytics: boolean;
  customReports: boolean;
  dataExport: boolean;
  
  // Team Collaboration
  teamCollaboration: boolean;
  crossDepartmentVisibility: boolean;
  
  // Integration & API
  apiAccess: boolean;
  webhooks: boolean;
  ssoIntegration: boolean;
  
  // Support Level
  supportLevel: 'email' | 'priority' | 'dedicated';
}

export interface TierInfo {
  tier: string;
  displayName: string;
  features: TierFeatures;
  pricing: {
    monthly: number;
    yearly: number;
  };
}

export function useSubscriptionTier() {
  const { user } = useAuth();

  const { data: tierInfo, isLoading, error } = useQuery<TierInfo>({
    queryKey: ['/api/subscription/tier-info'],
    enabled: !!(user as any)?.tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const hasFeature = (feature: keyof TierFeatures): boolean => {
    if (!tierInfo) return false;
    return !!tierInfo.features[feature];
  };

  const getFeatureLimit = (feature: 'maxEmployees'): number | null => {
    if (!tierInfo) return null;
    return tierInfo.features[feature];
  };

  const requiresUpgrade = (feature: keyof TierFeatures): boolean => {
    return !hasFeature(feature);
  };

  return {
    tierInfo,
    isLoading,
    error,
    hasFeature,
    getFeatureLimit,
    requiresUpgrade,
    // Convenient feature checks
    canManageDepartments: hasFeature('departmentManagement'),
    canBulkEditEmployees: hasFeature('bulkEmployeeOperations'),
    canUseAdvancedSearch: hasFeature('advancedEmployeeSearch'),
    canViewHierarchy: hasFeature('employeeHierarchy'),
    canExportData: hasFeature('dataExport'),
    maxEmployees: getFeatureLimit('maxEmployees')
  };
}