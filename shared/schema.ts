import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['platform_admin', 'tenant_admin', 'manager', 'employee']);

// Subscription tiers enum
export const subscriptionTierEnum = pgEnum('subscription_tier', ['platform', 'mj_scott', 'forming', 'storming', 'norming', 'performing', 'appsumo']);

// Notification types enum
export const notificationTypeEnum = pgEnum('notification_type', ['feedback_received', 'goal_reminder', 'performance_review', 'system_update', 'weekly_digest']);

// Notification status enum
export const notificationStatusEnum = pgEnum('notification_status', ['unread', 'read', 'archived']);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('employee'),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenants (companies) table
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  domain: varchar("domain").unique(),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default('forming'),
  maxEmployees: integer("max_employees").default(25),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Departments table
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  name: varchar("name").notNull(),
  description: text("description"),
  parentDepartmentId: varchar("parent_department_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job positions table
export const jobPositions = pgTable("job_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  title: varchar("title").notNull(),
  department: varchar("department"),
  level: integer("level").default(1), // 1-10 hierarchy level
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employees table (extends users for company-specific data)
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id),
  employeeNumber: varchar("employee_number"),
  jobPositionId: varchar("job_position_id").references(() => jobPositions.id),
  departmentId: varchar("department_id").references(() => departments.id),
  managerId: varchar("manager_id"),
  feedbackUrl: varchar("feedback_url").unique(), // e.g., "john-doe-x7k9"
  qrCodeData: text("qr_code_data"),
  hireDate: timestamp("hire_date"),
  status: varchar("status").default('active'), // active, inactive, terminated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feedback submissions table
export const feedbacks = pgTable("feedbacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  giverName: varchar("giver_name"),
  giverEmail: varchar("giver_email"),
  relationship: varchar("relationship"), // client, colleague, manager, vendor, etc.
  rating: integer("rating"), // 1-5 stars
  competencyScores: jsonb("competency_scores"), // JSON object with competency ratings
  comments: text("comments"),
  isAnonymous: boolean("is_anonymous").default(false),
  sentiment: varchar("sentiment"), // positive, negative, neutral
  createdAt: timestamp("created_at").defaultNow(),
});

// Performance goals table
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  title: varchar("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date"),
  status: varchar("status").default('in_progress'), // in_progress, completed, overdue
  progress: integer("progress").default(0), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Performance reviews table
export const performanceReviews = pgTable("performance_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => employees.id),
  reviewPeriod: varchar("review_period").notNull(),
  overallScore: decimal("overall_score", { precision: 3, scale: 2 }),
  competencyScores: jsonb("competency_scores"),
  comments: text("comments"),
  goals: jsonb("goals"),
  status: varchar("status").default('draft'), // draft, submitted, approved
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User notification preferences table
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  feedbackNotifications: boolean("feedback_notifications").default(true),
  goalReminders: boolean("goal_reminders").default(true),
  weeklyDigest: boolean("weekly_digest").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  status: notificationStatusEnum("status").default('unread'),
  metadata: jsonb("metadata"), // Additional data like employee ID, goal ID, etc.
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  employee: one(employees, {
    fields: [users.id],
    references: [employees.userId],
  }),
  notificationPreferences: one(notificationPreferences, {
    fields: [users.id],
    references: [notificationPreferences.userId],
  }),
  notifications: many(notifications),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  employees: many(employees),
  departments: many(departments),
  jobPositions: many(jobPositions),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [employees.tenantId],
    references: [tenants.id],
  }),
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  jobPosition: one(jobPositions, {
    fields: [employees.jobPositionId],
    references: [jobPositions.id],
  }),
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: "manager"
  }),
  directReports: many(employees, {
    relationName: "manager"
  }),
  feedbacks: many(feedbacks),
  goals: many(goals),
  performanceReviews: many(performanceReviews),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [departments.tenantId],
    references: [tenants.id],
  }),
  parentDepartment: one(departments, {
    fields: [departments.parentDepartmentId],
    references: [departments.id],
    relationName: "parentDepartment"
  }),
  subDepartments: many(departments, {
    relationName: "parentDepartment"
  }),
  employees: many(employees),
}));

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  employee: one(employees, {
    fields: [feedbacks.employeeId],
    references: [employees.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  employee: one(employees, {
    fields: [goals.employeeId],
    references: [employees.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPerformanceReviewSchema = createInsertSchema(performanceReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Tenant = typeof tenants.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type JobPosition = typeof jobPositions.$inferSelect;
export type Feedback = typeof feedbacks.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
