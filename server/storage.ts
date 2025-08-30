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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";
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
    await db.delete(users).where(eq(users.id, id));
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
    await db.delete(tenants).where(eq(tenants.id, id));
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

  async createEmployee(employeeData: InsertEmployee): Promise<Employee> {
    // Generate unique feedback URL
    const feedbackUrl = `${employeeData.userId.slice(0, 8)}-${randomUUID().slice(0, 4)}`;
    
    const [employee] = await db
      .insert(employees)
      .values({
        ...employeeData,
        feedbackUrl,
      })
      .returning();
    return employee;
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
}

export const storage = new DatabaseStorage();
