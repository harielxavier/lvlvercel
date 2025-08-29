import {
  users,
  tenants,
  employees,
  departments,
  jobPositions,
  feedbacks,
  goals,
  performanceReviews,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";
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

  async getEmployeesByTenant(tenantId: string): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.tenantId, tenantId));
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
      avgPerformance: 87, // TODO: Calculate from actual performance data
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
      monthlyRecurringRevenue: 0 // Will be calculated based on subscription tiers
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
}

export const storage = new DatabaseStorage();
