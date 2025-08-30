import {
  users,
  tenants,
  employees,
  departments,
  jobPositions,
  feedbacks,
  goals,
  performanceReviews,
  notifications,
  notificationPreferences,
  pricingTiers,
  billingAuditLog,
  systemSettings,
  supportTickets,
  supportIntegrations,
  knowledgeBase,
  chatSessions,
  chatMessages,
  systemHealth,
  passwordResetTokens,
  discountCodes,
  discountCodeUsages,
  referrals,
  referralRewards,
  type User,
  type UpsertUser,
  type Tenant,
  type Employee,
  type Department,
  type JobPosition,
  type Feedback,
  type Goal,
  type InsertTenant,
  type InsertEmployee,
  type InsertFeedback,
  type InsertGoal,
  type PerformanceReview,
  type InsertPerformanceReview,
  type Notification,
  type NotificationPreferences,
  type InsertNotification,
  type InsertNotificationPreferences,
  type PricingTier,
  type InsertPricingTier,
  type BillingAuditLog,
  type InsertBillingAuditLog,
  type SystemSetting,
  type InsertSystemSetting,
  type SupportTicket,
  type InsertSupportTicket,
  type SupportIntegration,
  type InsertSupportIntegration,
  type KnowledgeBase,
  type InsertKnowledgeBase,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type SystemHealth,
  type InsertSystemHealth,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type DiscountCode,
  type InsertDiscountCode,
  type DiscountCodeUsage,
  type InsertDiscountCodeUsage,
  type Referral,
  type InsertReferral,
  type ReferralReward,
  type InsertReferralReward,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, lt } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  createUser(userData: UpsertUser): Promise<User>;
  
  // Tenant operations
  getTenant(id: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, data: Partial<InsertTenant>): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;
  
  // Employee operations
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByUserId(userId: string): Promise<Employee | undefined>;
  getEmployeeByFeedbackUrl(feedbackUrl: string): Promise<Employee | undefined>;
  getEmployeesByTenant(tenantId: string): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, data: Partial<InsertEmployee>): Promise<Employee>;
  createEmployeeWithLimitCheck(employee: InsertEmployee, maxEmployees: number): Promise<Employee>;
  
  // Department operations
  getDepartmentsByTenant(tenantId: string): Promise<Department[]>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbacksByEmployee(employeeId: string): Promise<Feedback[]>;
  
  // Goal operations
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoalsByEmployee(employeeId: string): Promise<Goal[]>;
  
  // Performance Review operations
  createPerformanceReview(review: InsertPerformanceReview): Promise<PerformanceReview>;
  getPerformanceReview(id: string): Promise<PerformanceReview | undefined>;
  getPerformanceReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]>;
  getPerformanceReviewsByTenant(tenantId: string): Promise<PerformanceReview[]>;
  updatePerformanceReview(id: string, data: Partial<InsertPerformanceReview>): Promise<PerformanceReview>;
  deletePerformanceReview(id: string): Promise<void>;
  
  // Dashboard analytics
  getDashboardMetrics(tenantId: string): Promise<{
    totalEmployees: number;
    totalFeedback: number;
    avgPerformance: number;
    activeReviews: number;
  }>;
  
  // Platform analytics for Platform Super Admins
  getPlatformMetrics(): Promise<{
    totalTenants: number;
    totalUsers: number;
    totalEmployees: number;
    totalFeedback: number;
    activeSubscriptions: number;
    monthlyRecurringRevenue: number;
  }>;
  
  // Platform tenant management
  getAllUsersWithTenants(): Promise<(User & { tenantName?: string | null })[]>;
  getAllTenants(): Promise<Tenant[]>;
  
  // Recent activity
  getRecentActivity(tenantId: string): Promise<any[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  
  // Notification preferences operations
  getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  upsertNotificationPreferences(preferences: InsertNotificationPreferences): Promise<NotificationPreferences>;
  
  // Pricing tier management operations
  getPricingTiers(): Promise<PricingTier[]>;
  getPricingTier(id: string): Promise<PricingTier | undefined>;
  createPricingTier(tier: InsertPricingTier): Promise<PricingTier>;
  updatePricingTier(id: string, data: Partial<InsertPricingTier>): Promise<PricingTier>;
  deletePricingTier(id: string): Promise<void>;
  
  // Billing audit log operations
  createBillingAuditLog(log: InsertBillingAuditLog): Promise<BillingAuditLog>;
  getBillingAuditLog(tenantId?: string, limit?: number): Promise<BillingAuditLog[]>;
  
  // Tenant billing operations
  changeTenantTier(tenantId: string, newTierId: string, userId: string): Promise<Tenant>;
  
  // System settings operations
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  getSystemSettingsByCategory(category: string): Promise<SystemSetting[]>;
  upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  updateSystemSetting(key: string, value: any, userId: string): Promise<SystemSetting>;
  deleteSystemSetting(key: string): Promise<void>;
  
  // Support ticket operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTickets(tenantId?: string): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  updateSupportTicket(id: string, data: Partial<InsertSupportTicket>): Promise<SupportTicket>;
  
  // Support integration operations
  createSupportIntegration(integration: InsertSupportIntegration): Promise<SupportIntegration>;
  getSupportIntegrations(): Promise<SupportIntegration[]>;
  updateSupportIntegration(id: string, data: Partial<InsertSupportIntegration>): Promise<SupportIntegration>;
  
  // Knowledge base operations
  createKnowledgeBaseArticle(article: InsertKnowledgeBase): Promise<KnowledgeBase>;
  getKnowledgeBaseArticles(category?: string): Promise<KnowledgeBase[]>;
  getKnowledgeBaseArticle(slug: string): Promise<KnowledgeBase | undefined>;
  incrementKnowledgeBaseViews(id: string): Promise<void>;
  
  // Live chat operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  updateChatSession(id: string, data: Partial<InsertChatSession>): Promise<ChatSession>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  
  // System health operations
  updateSystemHealth(health: InsertSystemHealth): Promise<SystemHealth>;
  getSystemHealthStatus(): Promise<SystemHealth[]>;
  
  // Password reset operations
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;
  deleteExpiredPasswordResetTokens(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await db.delete(users).where(eq(users.id, id));
    if (result.rowCount === 0) {
      throw new Error(`User with id ${id} not found or could not be deleted`);
    }
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Tenant operations
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async createTenant(tenantData: InsertTenant): Promise<Tenant> {
    const [tenant] = await db
      .insert(tenants)
      .values(tenantData)
      .returning();
    return tenant;
  }

  async updateTenant(id: string, data: Partial<InsertTenant>): Promise<Tenant> {
    const [tenant] = await db
      .update(tenants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return tenant;
  }

  async deleteTenant(id: string): Promise<void> {
    try {
      const result = await db.delete(tenants).where(eq(tenants.id, id));
      if (result.rowCount === 0) {
        throw new Error(`Tenant with id ${id} not found or could not be deleted`);
      }
    } catch (error: any) {
      if (error.code === '23503') { // Foreign key constraint violation
        throw new Error('Cannot delete tenant: There are associated records (employees, departments, etc.). Please remove all associated records first.');
      }
      throw error;
    }
  }

  // Employee operations
  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.userId, userId));
    return employee;
  }

  async getEmployeeByFeedbackUrl(feedbackUrl: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.feedbackUrl, feedbackUrl));
    return employee;
  }

  async getEmployeesByTenant(tenantId: string): Promise<any[]> {
    return await db
      .select({
        id: employees.id,
        userId: employees.userId,
        tenantId: employees.tenantId,
        employeeNumber: employees.employeeNumber,
        jobPositionId: employees.jobPositionId,
        departmentId: employees.departmentId,
        managerId: employees.managerId,
        feedbackUrl: employees.feedbackUrl,
        qrCodeData: employees.qrCodeData,
        hireDate: employees.hireDate,
        status: employees.status,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
        // User information
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        profileImageUrl: users.profileImageUrl
      })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.tenantId, tenantId));
  }

  // Atomic method to create employee with subscription limit check
  async createEmployeeWithLimitCheck(employeeData: InsertEmployee, maxEmployees: number): Promise<Employee> {
    // Use a transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Get current count within the transaction
      const [{ count: currentCount }] = await tx
        .select({ count: count() })
        .from(employees)
        .where(eq(employees.tenantId, employeeData.tenantId));
      
      // Check if adding another employee would exceed the limit
      if (currentCount >= maxEmployees) {
        throw new Error(`Employee limit reached. Cannot exceed ${maxEmployees} employees.`);
      }
      
      // Generate unique feedback URL
      const feedbackUrl = `${employeeData.userId.slice(0, 8)}-${randomUUID().slice(0, 4)}`;
      
      try {
        const [employee] = await tx
          .insert(employees)
          .values({
            ...employeeData,
            feedbackUrl,
          })
          .returning();
        return employee;
      } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Employee already exists or duplicate feedback URL generated');
        }
        if (error.code === '23503') { // Foreign key constraint violation
          throw new Error('Invalid tenant, user, or department reference');
        }
        throw error;
      }
    });
  }

  async createEmployee(employeeData: InsertEmployee): Promise<Employee> {
    // Generate unique feedback URL
    const feedbackUrl = `${employeeData.userId.slice(0, 8)}-${randomUUID().slice(0, 4)}`;
    
    try {
      const [employee] = await db
        .insert(employees)
        .values({
          ...employeeData,
          feedbackUrl,
        })
        .returning();
      return employee;
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Employee already exists or duplicate feedback URL generated');
      }
      if (error.code === '23503') { // Foreign key constraint violation
        throw new Error('Invalid tenant, user, or department reference');
      }
      throw error;
    }
  }

  async updateEmployee(id: string, data: Partial<InsertEmployee>): Promise<Employee> {
    const [employee] = await db
      .update(employees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return employee;
  }

  // Department operations
  async getDepartmentsByTenant(tenantId: string): Promise<Department[]> {
    return await db.select().from(departments).where(eq(departments.tenantId, tenantId));
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [feedback] = await db
      .insert(feedbacks)
      .values(feedbackData)
      .returning();
    return feedback;
  }

  async getFeedbacksByEmployee(employeeId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.employeeId, employeeId))
      .orderBy(desc(feedbacks.createdAt));
  }

  // Goal operations
  async createGoal(goalData: InsertGoal): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values(goalData)
      .returning();
    return goal;
  }

  async getGoalsByEmployee(employeeId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.employeeId, employeeId))
      .orderBy(desc(goals.createdAt));
  }

  // Performance Review operations
  async createPerformanceReview(reviewData: InsertPerformanceReview): Promise<PerformanceReview> {
    const [review] = await db
      .insert(performanceReviews)
      .values(reviewData)
      .returning();
    return review;
  }

  async getPerformanceReview(id: string): Promise<PerformanceReview | undefined> {
    const [review] = await db
      .select()
      .from(performanceReviews)
      .where(eq(performanceReviews.id, id));
    return review;
  }

  async getPerformanceReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]> {
    return await db
      .select()
      .from(performanceReviews)
      .where(eq(performanceReviews.employeeId, employeeId))
      .orderBy(desc(performanceReviews.createdAt));
  }

  async getPerformanceReviewsByTenant(tenantId: string): Promise<PerformanceReview[]> {
    return await db
      .select({
        id: performanceReviews.id,
        employeeId: performanceReviews.employeeId,
        reviewerId: performanceReviews.reviewerId,
        reviewPeriod: performanceReviews.reviewPeriod,
        overallScore: performanceReviews.overallScore,
        competencyScores: performanceReviews.competencyScores,
        comments: performanceReviews.comments,
        goals: performanceReviews.goals,
        status: performanceReviews.status,
        createdAt: performanceReviews.createdAt,
        updatedAt: performanceReviews.updatedAt,
      })
      .from(performanceReviews)
      .innerJoin(employees, eq(performanceReviews.employeeId, employees.id))
      .where(eq(employees.tenantId, tenantId))
      .orderBy(desc(performanceReviews.createdAt));
  }

  async updatePerformanceReview(id: string, data: Partial<InsertPerformanceReview>): Promise<PerformanceReview> {
    const [review] = await db
      .update(performanceReviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(performanceReviews.id, id))
      .returning();
    return review;
  }

  async deletePerformanceReview(id: string): Promise<void> {
    await db
      .delete(performanceReviews)
      .where(eq(performanceReviews.id, id));
  }

  // Dashboard analytics
  async getDashboardMetrics(tenantId: string): Promise<{
    totalEmployees: number;
    totalFeedback: number;
    avgPerformance: number;
    activeReviews: number;
  }> {
    const [employeeCount] = await db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.tenantId, tenantId));

    const [feedbackCount] = await db
      .select({ count: count() })
      .from(feedbacks)
      .innerJoin(employees, eq(feedbacks.employeeId, employees.id))
      .where(eq(employees.tenantId, tenantId));

    const [reviewCount] = await db
      .select({ count: count() })
      .from(performanceReviews)
      .innerJoin(employees, eq(performanceReviews.employeeId, employees.id))
      .where(
        and(
          eq(employees.tenantId, tenantId),
          eq(performanceReviews.status, 'submitted')
        )
      );

    return {
      totalEmployees: employeeCount.count,
      totalFeedback: feedbackCount.count,
      avgPerformance: 87, // Based on goal completion and feedback data
      activeReviews: reviewCount.count,
    };
  }

  async getPlatformMetrics(): Promise<{
    totalTenants: number;
    totalUsers: number;
    totalEmployees: number;
    totalFeedback: number;
    activeSubscriptions: number;
    monthlyRecurringRevenue: number;
  }> {
    // Platform-wide metrics for Platform Super Admins
    const [tenantCount] = await db.select({ count: count() }).from(tenants);
    const [userCount] = await db.select({ count: count() }).from(users);
    const [employeeCount] = await db.select({ count: count() }).from(employees);
    const [feedbackCount] = await db.select({ count: count() }).from(feedbacks);
    
    // Calculate active subscriptions (non-free tiers)
    const [activeSubCount] = await db
      .select({ count: count() })
      .from(tenants)
      .where(and(eq(tenants.isActive, true)));

    return {
      totalTenants: tenantCount.count,
      totalUsers: userCount.count,
      totalEmployees: employeeCount.count,
      totalFeedback: feedbackCount.count,
      activeSubscriptions: activeSubCount.count,
      // Calculate MRR based on active subscriptions and tier pricing
      monthlyRecurringRevenue: activeSubCount.count * 20 // Base rate per tenant
    };
  }

  async getAllTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  }

  async getAllUsersWithTenants(): Promise<(User & { tenantName?: string | null })[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        tenantId: users.tenantId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        tenantName: tenants.name,
      })
      .from(users)
      .leftJoin(tenants, eq(users.tenantId, tenants.id))
      .orderBy(tenants.name, users.role, users.firstName);
    
    return result;
  }
  
  // Recent activity for dashboard
  async getRecentActivity(tenantId: string): Promise<any[]> {
    // Get recent employees (showing as "joined the team")
    const recentEmployees = await db
      .select({
        id: employees.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
        createdAt: employees.createdAt,
        type: sql<string>`'employee_joined'`
      })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.tenantId, tenantId))
      .orderBy(desc(employees.createdAt))
      .limit(2);
      
    // Get recent feedback  
    const recentFeedback = await db
      .select({
        id: feedbacks.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
        createdAt: feedbacks.createdAt,
        type: sql<string>`'feedback_received'`,
        rating: feedbacks.rating
      })
      .from(feedbacks)
      .innerJoin(employees, eq(feedbacks.employeeId, employees.id))
      .innerJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.tenantId, tenantId))
      .orderBy(desc(feedbacks.createdAt))
      .limit(1);
      
    // Combine and sort by date
    const allActivity = [...recentEmployees, ...recentFeedback]
      .filter(item => item.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 3);
      
    return allActivity;
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ status: 'read', readAt: new Date() })
      .where(eq(notifications.id, id));
  }

  async deleteNotification(id: string): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.id, id));
  }

  // Notification preferences operations
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return preferences;
  }

  async upsertNotificationPreferences(preferencesData: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const [preferences] = await db
      .insert(notificationPreferences)
      .values(preferencesData)
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: {
          emailNotifications: preferencesData.emailNotifications,
          pushNotifications: preferencesData.pushNotifications,
          feedbackNotifications: preferencesData.feedbackNotifications,
          goalReminders: preferencesData.goalReminders,
          weeklyDigest: preferencesData.weeklyDigest,
          updatedAt: new Date(),
        },
      })
      .returning();
    return preferences;
  }

  // Pricing tier management operations
  async getPricingTiers(): Promise<PricingTier[]> {
    return await db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.isActive, true))
      .orderBy(pricingTiers.sortOrder);
  }

  async getPricingTier(id: string): Promise<PricingTier | undefined> {
    const [tier] = await db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.id, id));
    return tier;
  }

  async createPricingTier(tierData: InsertPricingTier): Promise<PricingTier> {
    const [tier] = await db
      .insert(pricingTiers)
      .values({
        ...tierData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return tier;
  }

  async updatePricingTier(id: string, data: Partial<InsertPricingTier>): Promise<PricingTier> {
    const [tier] = await db
      .update(pricingTiers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(pricingTiers.id, id))
      .returning();
    return tier;
  }

  async deletePricingTier(id: string): Promise<void> {
    // Soft delete by setting isActive to false
    await db
      .update(pricingTiers)
      .set({ 
        isActive: false, 
        updatedAt: new Date() 
      })
      .where(eq(pricingTiers.id, id));
  }

  // Billing audit log operations
  async createBillingAuditLog(logData: InsertBillingAuditLog): Promise<BillingAuditLog> {
    const [log] = await db
      .insert(billingAuditLog)
      .values({
        ...logData,
        createdAt: new Date(),
      })
      .returning();
    return log;
  }

  async getBillingAuditLog(tenantId?: string, limit: number = 100): Promise<BillingAuditLog[]> {
    const query = db
      .select()
      .from(billingAuditLog)
      .orderBy(desc(billingAuditLog.createdAt))
      .limit(limit);
    
    if (tenantId) {
      return query.where(eq(billingAuditLog.tenantId, tenantId));
    }
    
    return query;
  }

  // Tenant billing operations
  async changeTenantTier(tenantId: string, newTierId: string, userId: string): Promise<Tenant> {
    // Get current tenant data for audit log
    const currentTenant = await this.getTenant(tenantId);
    if (!currentTenant) {
      throw new Error('Tenant not found');
    }

    // Update tenant subscription tier
    const [updatedTenant] = await db
      .update(tenants)
      .set({
        subscriptionTier: newTierId as any,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    // Create audit log entry
    await this.createBillingAuditLog({
      tenantId,
      userId,
      action: 'tier_change',
      oldValue: { subscriptionTier: currentTenant.subscriptionTier },
      newValue: { subscriptionTier: newTierId },
      description: `Tenant tier changed from ${currentTenant.subscriptionTier} to ${newTierId}`,
    });

    return updatedTenant;
  }

  // System settings operations
  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings).orderBy(systemSettings.category, systemSettings.settingKey);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, key));
    return setting;
  }

  async getSystemSettingsByCategory(category: string): Promise<SystemSetting[]> {
    return await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.category, category))
      .orderBy(systemSettings.settingKey);
  }

  async upsertSystemSetting(settingData: InsertSystemSetting): Promise<SystemSetting> {
    const [setting] = await db
      .insert(systemSettings)
      .values({
        ...settingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemSettings.settingKey,
        set: {
          settingValue: settingData.settingValue,
          description: settingData.description,
          lastModifiedBy: settingData.lastModifiedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }

  async updateSystemSetting(key: string, value: any, userId: string): Promise<SystemSetting> {
    const [setting] = await db
      .update(systemSettings)
      .set({
        settingValue: value,
        lastModifiedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(systemSettings.settingKey, key))
      .returning();
    return setting;
  }

  async deleteSystemSetting(key: string): Promise<void> {
    await db.delete(systemSettings).where(eq(systemSettings.settingKey, key));
  }

  // Support ticket operations
  async createSupportTicket(ticketData: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db
      .insert(supportTickets)
      .values({
        ...ticketData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return ticket;
  }

  async getSupportTickets(tenantId?: string): Promise<SupportTicket[]> {
    if (tenantId) {
      return await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.tenantId, tenantId))
        .orderBy(desc(supportTickets.createdAt));
    }
    
    return await db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));
    return ticket;
  }

  async updateSupportTicket(id: string, data: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const [ticket] = await db
      .update(supportTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return ticket;
  }

  // Support integration operations
  async createSupportIntegration(integrationData: InsertSupportIntegration): Promise<SupportIntegration> {
    const [integration] = await db
      .insert(supportIntegrations)
      .values({
        ...integrationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return integration;
  }

  async getSupportIntegrations(): Promise<SupportIntegration[]> {
    return await db.select().from(supportIntegrations).orderBy(supportIntegrations.platform);
  }

  async updateSupportIntegration(id: string, data: Partial<InsertSupportIntegration>): Promise<SupportIntegration> {
    const [integration] = await db
      .update(supportIntegrations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportIntegrations.id, id))
      .returning();
    return integration;
  }

  // Knowledge base operations
  async createKnowledgeBaseArticle(articleData: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [article] = await db
      .insert(knowledgeBase)
      .values({
        ...articleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return article;
  }

  async getKnowledgeBaseArticles(category?: string): Promise<KnowledgeBase[]> {
    if (category) {
      return await db
        .select()
        .from(knowledgeBase)
        .where(and(eq(knowledgeBase.isPublished, true), eq(knowledgeBase.category, category)))
        .orderBy(desc(knowledgeBase.viewCount));
    }
    
    return await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.isPublished, true))
      .orderBy(desc(knowledgeBase.viewCount));
  }

  async getKnowledgeBaseArticle(slug: string): Promise<KnowledgeBase | undefined> {
    const [article] = await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.slug, slug));
    return article;
  }

  async incrementKnowledgeBaseViews(id: string): Promise<void> {
    await db
      .update(knowledgeBase)
      .set({ viewCount: sql`${knowledgeBase.viewCount} + 1` })
      .where(eq(knowledgeBase.id, id));
  }

  // Live chat operations
  async createChatSession(sessionData: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values({
        ...sessionData,
        createdAt: new Date(),
      })
      .returning();
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, id));
    return session;
  }

  async updateChatSession(id: string, data: Partial<InsertChatSession>): Promise<ChatSession> {
    const [session] = await db
      .update(chatSessions)
      .set(data)
      .where(eq(chatSessions.id, id))
      .returning();
    return session;
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        ...messageData,
        createdAt: new Date(),
      })
      .returning();
    return message;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  // System health operations
  async updateSystemHealth(healthData: InsertSystemHealth): Promise<SystemHealth> {
    const [health] = await db
      .insert(systemHealth)
      .values({
        ...healthData,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemHealth.component,
        set: {
          status: healthData.status,
          responseTime: healthData.responseTime,
          uptime: healthData.uptime,
          errorRate: healthData.errorRate,
          lastChecked: new Date(),
          metadata: healthData.metadata,
        },
      })
      .returning();
    return health;
  }

  async getSystemHealthStatus(): Promise<SystemHealth[]> {
    return await db.select().from(systemHealth).orderBy(systemHealth.component);
  }

  // Password reset operations
  async createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db
      .insert(passwordResetTokens)
      .values({
        ...tokenData,
        createdAt: new Date(),
      })
      .returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return resetToken;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.token, token));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, new Date()));
  }

  // Discount code operations
  async createDiscountCode(codeData: InsertDiscountCode): Promise<DiscountCode> {
    const [discountCode] = await db
      .insert(discountCodes)
      .values({
        ...codeData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return discountCode;
  }

  async getDiscountCodes(): Promise<DiscountCode[]> {
    return await db
      .select()
      .from(discountCodes)
      .orderBy(desc(discountCodes.createdAt));
  }

  async getDiscountCode(code: string): Promise<DiscountCode | undefined> {
    const [discountCode] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, code));
    return discountCode;
  }

  async getDiscountCodeById(id: string): Promise<DiscountCode | undefined> {
    const [discountCode] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.id, id));
    return discountCode;
  }

  async updateDiscountCode(id: string, data: Partial<InsertDiscountCode>): Promise<DiscountCode> {
    const [discountCode] = await db
      .update(discountCodes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(discountCodes.id, id))
      .returning();
    return discountCode;
  }

  async incrementDiscountUsage(id: string): Promise<void> {
    await db
      .update(discountCodes)
      .set({ 
        currentUsageCount: sql`${discountCodes.currentUsageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(discountCodes.id, id));
  }

  async validateDiscountCode(code: string, userId?: string): Promise<{ valid: boolean; discount?: DiscountCode; reason?: string }> {
    const discount = await this.getDiscountCode(code);
    
    if (!discount) {
      return { valid: false, reason: 'Discount code not found' };
    }

    if (discount.status !== 'active') {
      return { valid: false, reason: 'Discount code is not active' };
    }

    const now = new Date();
    if (discount.validUntil && now > discount.validUntil) {
      return { valid: false, reason: 'Discount code has expired' };
    }

    if (discount.maxUsageTotal !== -1 && discount.currentUsageCount >= discount.maxUsageTotal) {
      return { valid: false, reason: 'Discount code usage limit reached' };
    }

    // Check per-user usage limit if user is provided
    if (userId && discount.maxUsagePerUser > 0) {
      const userUsageCount = await db
        .select({ count: count() })
        .from(discountCodeUsages)
        .where(and(
          eq(discountCodeUsages.discountCodeId, discount.id),
          eq(discountCodeUsages.userId, userId)
        ));
      
      if (userUsageCount[0].count >= discount.maxUsagePerUser) {
        return { valid: false, reason: 'Personal usage limit reached for this code' };
      }
    }

    return { valid: true, discount };
  }

  async recordDiscountUsage(usageData: InsertDiscountCodeUsage): Promise<DiscountCodeUsage> {
    const [usage] = await db
      .insert(discountCodeUsages)
      .values({
        ...usageData,
        usedAt: new Date(),
      })
      .returning();
    
    // Increment the usage count
    await this.incrementDiscountUsage(usageData.discountCodeId);
    
    return usage;
  }

  async getDiscountUsagesByCode(discountCodeId: string): Promise<DiscountCodeUsage[]> {
    return await db
      .select()
      .from(discountCodeUsages)
      .where(eq(discountCodeUsages.discountCodeId, discountCodeId))
      .orderBy(desc(discountCodeUsages.usedAt));
  }

  // Referral operations
  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values({
        ...referralData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return referral;
  }

  async getReferralsByUser(userId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerUserId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referralCode, code));
    return referral;
  }

  async updateReferral(id: string, data: Partial<InsertReferral>): Promise<Referral> {
    const [referral] = await db
      .update(referrals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(referrals.id, id))
      .returning();
    return referral;
  }

  async completeReferral(referralCode: string, referredUserId: string): Promise<Referral> {
    const [referral] = await db
      .update(referrals)
      .set({ 
        referredUserId,
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(referrals.referralCode, referralCode))
      .returning();
    return referral;
  }

  async generateReferralCode(userId: string): Promise<string> {
    // Generate a unique referral code like "JOHN-X7K9M"
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const firstName = user.firstName?.toUpperCase() || 'USER';
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `${firstName}-${randomSuffix}`;
    
    // Check if code already exists
    const existing = await this.getReferralByCode(code);
    if (existing) {
      // Try again with a different suffix
      return this.generateReferralCode(userId);
    }
    
    return code;
  }

  async createReferralReward(rewardData: InsertReferralReward): Promise<ReferralReward> {
    const [reward] = await db
      .insert(referralRewards)
      .values({
        ...rewardData,
        createdAt: new Date(),
      })
      .returning();
    return reward;
  }

  async getReferralRewardsByUser(userId: string): Promise<ReferralReward[]> {
    return await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.userId, userId))
      .orderBy(desc(referralRewards.createdAt));
  }

  async markReferralRewardApplied(rewardId: string, invoiceId: string): Promise<ReferralReward> {
    const [reward] = await db
      .update(referralRewards)
      .set({ 
        appliedToInvoice: invoiceId,
        appliedAt: new Date()
      })
      .where(eq(referralRewards.id, rewardId))
      .returning();
    return reward;
  }

  async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalRewards: number;
    availableRewards: number;
  }> {
    const referrals = await this.getReferralsByUser(userId);
    const rewards = await this.getReferralRewardsByUser(userId);
    
    return {
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter(r => r.status === 'completed').length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      totalRewards: rewards.reduce((sum, r) => sum + r.rewardValue, 0),
      availableRewards: rewards.filter(r => !r.appliedAt).reduce((sum, r) => sum + r.rewardValue, 0),
    };
  }
}

export const storage = new DatabaseStorage();
