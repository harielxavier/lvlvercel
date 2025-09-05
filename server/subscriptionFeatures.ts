// Define subscription tiers since they may not be in shared schema yet
export type SubscriptionTier = 'mj_scott' | 'forming' | 'storming' | 'norming' | 'performing' | 'appsumo' | 'platform' | 'custom';

// Define feature flags for each subscription tier
export interface TierFeatures {
  // Core Features
  basicEmployeeManagement: boolean;
  basicDashboard: boolean;
  employeeProfiles: boolean;
  
  // Employee Management
  maxEmployees: number | null; // null = unlimited
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

// Feature matrix for each subscription tier
export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  mj_scott: {
    // Core Features
    basicEmployeeManagement: true,
    basicDashboard: true,
    employeeProfiles: true,
    
    // Employee Management
    maxEmployees: 10,
    bulkEmployeeOperations: false,
    advancedEmployeeSearch: false,
    departmentManagement: false,
    jobPositionManagement: false,
    employeeHierarchy: false,
    
    // Performance & Reviews
    performanceReviews: true,
    advancedPerformanceMetrics: false,
    customPerformanceCriteria: false,
    
    // Feedback System
    basicFeedback: true,
    qrCodeFeedback: true,
    advancedFeedbackAnalytics: false,
    realTimeFeedbackAlerts: false,
    
    // Goals & Development
    goalTracking: true,
    advancedGoalAnalytics: false,
    personalDevelopmentPlans: false,
    
    // Analytics & Reporting
    basicReporting: true,
    advancedAnalytics: false,
    customReports: false,
    dataExport: false,
    
    // Team Collaboration
    teamCollaboration: false,
    crossDepartmentVisibility: false,
    
    // Integration & API
    apiAccess: false,
    webhooks: false,
    ssoIntegration: false,
    
    // Support Level
    supportLevel: 'email'
  },
  
  forming: {
    // Core Features
    basicEmployeeManagement: true,
    basicDashboard: true,
    employeeProfiles: true,
    
    // Employee Management
    maxEmployees: null, // unlimited
    bulkEmployeeOperations: true,
    advancedEmployeeSearch: true,
    departmentManagement: true,
    jobPositionManagement: true,
    employeeHierarchy: true,
    
    // Performance & Reviews
    performanceReviews: true,
    advancedPerformanceMetrics: false,
    customPerformanceCriteria: false,
    
    // Feedback System
    basicFeedback: true,
    qrCodeFeedback: true,
    advancedFeedbackAnalytics: true,
    realTimeFeedbackAlerts: true,
    
    // Goals & Development
    goalTracking: true,
    advancedGoalAnalytics: true,
    personalDevelopmentPlans: false,
    
    // Analytics & Reporting
    basicReporting: true,
    advancedAnalytics: true,
    customReports: false,
    dataExport: false,
    
    // Team Collaboration
    teamCollaboration: true,
    crossDepartmentVisibility: false,
    
    // Integration & API
    apiAccess: false,
    webhooks: false,
    ssoIntegration: false,
    
    // Support Level
    supportLevel: 'email'
  },
  
  storming: {
    // Core Features
    basicEmployeeManagement: true,
    basicDashboard: true,
    employeeProfiles: true,
    
    // Employee Management
    maxEmployees: null,
    bulkEmployeeOperations: true,
    advancedEmployeeSearch: true,
    departmentManagement: true,
    jobPositionManagement: true,
    employeeHierarchy: true,
    
    // Performance & Reviews
    performanceReviews: true,
    advancedPerformanceMetrics: true,
    customPerformanceCriteria: true,
    
    // Feedback System
    basicFeedback: true,
    qrCodeFeedback: true,
    advancedFeedbackAnalytics: true,
    realTimeFeedbackAlerts: true,
    
    // Goals & Development
    goalTracking: true,
    advancedGoalAnalytics: true,
    personalDevelopmentPlans: true,
    
    // Analytics & Reporting
    basicReporting: true,
    advancedAnalytics: true,
    customReports: true,
    dataExport: true,
    
    // Team Collaboration
    teamCollaboration: true,
    crossDepartmentVisibility: true,
    
    // Integration & API
    apiAccess: true,
    webhooks: false,
    ssoIntegration: false,
    
    // Support Level
    supportLevel: 'priority'
  },
  
  norming: {
    // Core Features
    basicEmployeeManagement: true,
    basicDashboard: true,
    employeeProfiles: true,
    
    // Employee Management
    maxEmployees: null,
    bulkEmployeeOperations: true,
    advancedEmployeeSearch: true,
    departmentManagement: true,
    jobPositionManagement: true,
    employeeHierarchy: true,
    
    // Performance & Reviews
    performanceReviews: true,
    advancedPerformanceMetrics: true,
    customPerformanceCriteria: true,
    
    // Feedback System
    basicFeedback: true,
    qrCodeFeedback: true,
    advancedFeedbackAnalytics: true,
    realTimeFeedbackAlerts: true,
    
    // Goals & Development
    goalTracking: true,
    advancedGoalAnalytics: true,
    personalDevelopmentPlans: true,
    
    // Analytics & Reporting
    basicReporting: true,
    advancedAnalytics: true,
    customReports: true,
    dataExport: true,
    
    // Team Collaboration
    teamCollaboration: true,
    crossDepartmentVisibility: true,
    
    // Integration & API
    apiAccess: true,
    webhooks: true,
    ssoIntegration: true,
    
    // Support Level
    supportLevel: 'priority'
  },
  
  performing: {
    // Core Features
    basicEmployeeManagement: true,
    basicDashboard: true,
    employeeProfiles: true,
    
    // Employee Management
    maxEmployees: null,
    bulkEmployeeOperations: true,
    advancedEmployeeSearch: true,
    departmentManagement: true,
    jobPositionManagement: true,
    employeeHierarchy: true,
    
    // Performance & Reviews
    performanceReviews: true,
    advancedPerformanceMetrics: true,
    customPerformanceCriteria: true,
    
    // Feedback System
    basicFeedback: true,
    qrCodeFeedback: true,
    advancedFeedbackAnalytics: true,
    realTimeFeedbackAlerts: true,
    
    // Goals & Development
    goalTracking: true,
    advancedGoalAnalytics: true,
    personalDevelopmentPlans: true,
    
    // Analytics & Reporting
    basicReporting: true,
    advancedAnalytics: true,
    customReports: true,
    dataExport: true,
    
    // Team Collaboration
    teamCollaboration: true,
    crossDepartmentVisibility: true,
    
    // Integration & API
    apiAccess: true,
    webhooks: true,
    ssoIntegration: true,
    
    // Support Level
    supportLevel: 'dedicated'
  },
  
  appsumo: {
    // Core Features
    basicEmployeeManagement: true,
    basicDashboard: true,
    employeeProfiles: true,
    
    // Employee Management
    maxEmployees: null,
    bulkEmployeeOperations: true,
    advancedEmployeeSearch: true,
    departmentManagement: true,
    jobPositionManagement: true,
    employeeHierarchy: true,
    
    // Performance & Reviews
    performanceReviews: true,
    advancedPerformanceMetrics: true,
    customPerformanceCriteria: false, // Limited for AppSumo
    
    // Feedback System
    basicFeedback: true,
    qrCodeFeedback: true,
    advancedFeedbackAnalytics: true,
    realTimeFeedbackAlerts: false, // Limited for AppSumo
    
    // Goals & Development
    goalTracking: true,
    advancedGoalAnalytics: true,
    personalDevelopmentPlans: false, // Limited for AppSumo
    
    // Analytics & Reporting
    basicReporting: true,
    advancedAnalytics: true,
    customReports: false, // Limited for AppSumo
    dataExport: false, // Limited for AppSumo
    
    // Team Collaboration
    teamCollaboration: true,
    crossDepartmentVisibility: false, // Limited for AppSumo
    
    // Integration & API
    apiAccess: false, // Limited for AppSumo
    webhooks: false, // Limited for AppSumo
    ssoIntegration: false, // Limited for AppSumo
    
    // Support Level
    supportLevel: 'email'
  },

  platform: {
    // Core Features - Platform admin has everything
    basicEmployeeManagement: true,
    basicDashboard: true,
    employeeProfiles: true,

    // Employee Management
    maxEmployees: null, // unlimited
    bulkEmployeeOperations: true,
    advancedEmployeeSearch: true,
    departmentManagement: true,
    jobPositionManagement: true,
    employeeHierarchy: true,

    // Performance & Reviews
    performanceReviews: true,
    advancedPerformanceMetrics: true,
    customPerformanceCriteria: true,

    // Feedback System
    basicFeedback: true,
    qrCodeFeedback: true,
    advancedFeedbackAnalytics: true,
    realTimeFeedbackAlerts: true,

    // Goals & Development
    goalSetting: true,
    advancedGoalTracking: true,
    developmentPlans: true,
    skillAssessments: true,

    // Analytics & Reporting
    basicReporting: true,
    advancedAnalytics: true,
    customReports: true,
    dataExport: true,

    // Customization
    customBranding: true,
    customFields: true,
    workflowCustomization: true,

    // Integration & API
    apiAccess: true,
    webhooks: true,
    ssoIntegration: true,

    // Support Level
    supportLevel: 'dedicated'
  },

  custom: {
    // Core Features - Custom enterprise has everything
    basicEmployeeManagement: true,
    basicDashboard: true,
    employeeProfiles: true,

    // Employee Management
    maxEmployees: null, // unlimited
    bulkEmployeeOperations: true,
    advancedEmployeeSearch: true,
    departmentManagement: true,
    jobPositionManagement: true,
    employeeHierarchy: true,

    // Performance & Reviews
    performanceReviews: true,
    advancedPerformanceMetrics: true,
    customPerformanceCriteria: true,

    // Feedback System
    basicFeedback: true,
    qrCodeFeedback: true,
    advancedFeedbackAnalytics: true,
    realTimeFeedbackAlerts: true,

    // Goals & Development
    goalSetting: true,
    advancedGoalTracking: true,
    developmentPlans: true,
    skillAssessments: true,

    // Analytics & Reporting
    basicReporting: true,
    advancedAnalytics: true,
    customReports: true,
    dataExport: true,

    // Customization
    customBranding: true,
    customFields: true,
    workflowCustomization: true,

    // Integration & API
    apiAccess: true,
    webhooks: true,
    ssoIntegration: true,

    // Support Level
    supportLevel: 'dedicated'
  }
};

// Helper function to get features for a specific tier
export function getTierFeatures(tier: SubscriptionTier): TierFeatures {
  return TIER_FEATURES[tier];
}

// Helper function to check if a feature is available for a tier
export function hasFeature(tier: SubscriptionTier, feature: keyof TierFeatures): boolean {
  const features = getTierFeatures(tier);
  return !!features[feature];
}

// Get tier display information
export function getTierInfo(tier: SubscriptionTier) {
  const features = getTierFeatures(tier);
  
  const displayNames: Record<SubscriptionTier, string> = {
    mj_scott: 'MJ Scott (VIP)',
    forming: 'Forming',
    storming: 'Storming',
    norming: 'Norming',
    performing: 'Performing',
    appsumo: 'AppSumo Lifetime',
    platform: 'Platform Admin',
    custom: 'Custom Enterprise'
  };
  
  const pricing: Record<SubscriptionTier, { monthly: number; yearly: number }> = {
    mj_scott: { monthly: 0, yearly: 0 },
    forming: { monthly: 5, yearly: 4 },
    storming: { monthly: 10, yearly: 8 },
    norming: { monthly: 15, yearly: 12 },
    performing: { monthly: 25, yearly: 20 },
    appsumo: { monthly: 0, yearly: 0 }, // Lifetime deal
    platform: { monthly: 0, yearly: 0 }, // Platform admin
    custom: { monthly: 0, yearly: 0 } // Custom pricing
  };
  
  return {
    tier,
    features,
    displayName: displayNames[tier],
    pricing: pricing[tier]
  };
}

// Validation function for feature access
export async function validateFeatureAccess(
  userId: string,
  feature: keyof TierFeatures,
  storage: any
): Promise<{ allowed: boolean; reason?: string; tier?: SubscriptionTier }> {
  try {
    const user = await storage.getUser(userId);
    if (!user || !user.tenantId) {
      return { allowed: false, reason: "User or tenant not found" };
    }

    // Platform admins have access to all features
    if (user.role === 'platform_admin') {
      return { allowed: true };
    }

    const tenant = await storage.getTenant(user.tenantId);
    if (!tenant) {
      return { allowed: false, reason: "Tenant not found" };
    }

    const hasAccess = hasFeature(tenant.subscriptionTier, feature);
    
    return {
      allowed: hasAccess,
      reason: hasAccess ? undefined : `Feature '${feature}' not available in ${tenant.subscriptionTier} tier`,
      tier: tenant.subscriptionTier
    };
  } catch (error) {
    console.error('[FEATURE_ACCESS] Validation failed:', error);
    return { allowed: false, reason: "Feature validation failed" };
  }
}