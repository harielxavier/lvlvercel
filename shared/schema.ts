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
export const subscriptionTierEnum = pgEnum('subscription_tier', ['platform', 'mj_scott', 'forming', 'storming', 'norming', 'performing', 'appsumo', 'custom']);

// Notification types enum
export const notificationTypeEnum = pgEnum('notification_type', ['feedback_received', 'goal_reminder', 'performance_review', 'system_update', 'weekly_digest']);

// Notification status enum
export const notificationStatusEnum = pgEnum('notification_status', ['unread', 'read', 'archived']);

// Support ticket status enum
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'pending', 'in_progress', 'resolved', 'closed']);

// Support ticket priority enum
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'urgent']);

// Support integration enum
export const supportIntegrationEnum = pgEnum('support_integration', ['zendesk', 'freshdesk', 'salesforce']);

// Knowledge base category enum
export const kbCategoryEnum = pgEnum('kb_category', ['getting_started', 'features', 'billing', 'troubleshooting', 'api', 'security']);

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
}, (table) => [
  index("employees_user_id_idx").on(table.userId),
  index("employees_tenant_id_idx").on(table.tenantId),
  index("employees_feedback_url_idx").on(table.feedbackUrl),
]);

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
}, (table) => [
  index("feedbacks_employee_id_idx").on(table.employeeId),
]);

// Performance goals table
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category"), // professional, team, product, leadership, personal
  priority: varchar("priority").default('medium'), // high, medium, low
  goalType: varchar("goal_type").default('personal'), // personal, team, department, company
  difficulty: varchar("difficulty").default('medium'), // easy, medium, hard, expert
  visibility: varchar("visibility").default('private'), // private, team, public
  targetDate: timestamp("target_date"),
  status: varchar("status").default('in_progress'), // in_progress, completed, overdue, on_hold
  progress: integer("progress").default(0), // 0-100
  milestones: jsonb("milestones"), // Array of milestone objects
  tags: text("tags").array(), // Array of tags for organization
  notes: text("notes"), // Additional notes and updates
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("goals_employee_id_idx").on(table.employeeId),
]);

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
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  feedbackNotifications: boolean("feedback_notifications").default(true),
  goalReminders: boolean("goal_reminders").default(true),
  weeklyDigest: boolean("weekly_digest").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pricing tiers table (for dynamic pricing management)
export const pricingTiers = pgTable("pricing_tiers", {
  id: varchar("id").primaryKey(), // e.g., 'forming', 'storming', etc.
  name: varchar("name").notNull(),
  description: text("description"),
  monthlyPrice: integer("monthly_price").notNull(), // in cents
  yearlyPrice: integer("yearly_price").notNull(), // in cents
  maxSeats: integer("max_seats").default(-1), // -1 for unlimited
  features: jsonb("features").notNull(), // Array of feature strings
  targetMarket: text("target_market"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Billing audit log table
export const billingAuditLog = pgTable("billing_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id), // Admin who made the change
  action: varchar("action").notNull(), // 'tier_change', 'price_update', 'tier_create', etc.
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System settings table for platform-wide configuration
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: varchar("setting_key").notNull().unique(),
  settingValue: jsonb("setting_value").notNull(),
  category: varchar("category").notNull(), // 'platform', 'security', 'notifications', 'database', 'performance'
  description: text("description"),
  isEditable: boolean("is_editable").default(true),
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support tickets table
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  externalTicketId: varchar("external_ticket_id"), // ID from Zendesk/Freshdesk/Salesforce
  integration: supportIntegrationEnum("integration"), // Which system created this
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").default('open'),
  priority: ticketPriorityEnum("priority").default('medium'),
  category: varchar("category"), // 'technical', 'billing', 'feature_request', 'bug'
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  escalationLevel: integer("escalation_level").default(0),
  lastEscalatedAt: timestamp("last_escalated_at"),
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),
  customerEmail: varchar("customer_email"),
  metadata: jsonb("metadata"), // Additional data from external systems
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support integration configurations
export const supportIntegrations = pgTable("support_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: supportIntegrationEnum("platform").notNull(),
  apiKey: varchar("api_key"), // Encrypted
  apiSecret: varchar("api_secret"), // Encrypted  
  subdomain: varchar("subdomain"), // For Zendesk/Freshdesk
  instanceUrl: varchar("instance_url"), // For Salesforce
  isActive: boolean("is_active").default(false),
  webhookUrl: varchar("webhook_url"),
  lastSyncedAt: timestamp("last_synced_at"),
  syncErrors: integer("sync_errors").default(0),
  configuredBy: varchar("configured_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Knowledge base articles
export const knowledgeBase = pgTable("knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: kbCategoryEnum("category").notNull(),
  slug: varchar("slug").notNull().unique(),
  tags: text("tags").array(),
  isPublished: boolean("is_published").default(false),
  viewCount: integer("view_count").default(0),
  helpfulVotes: integer("helpful_votes").default(0),
  unhelpfulVotes: integer("unhelpful_votes").default(0),
  authorId: varchar("author_id").references(() => users.id),
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live chat sessions
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id),
  userId: varchar("user_id").references(() => users.id),
  agentId: varchar("agent_id").references(() => users.id),
  status: varchar("status").default('waiting'), // 'waiting', 'active', 'ended'
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  rating: integer("rating"), // 1-5
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id),
  senderId: varchar("sender_id").references(() => users.id),
  senderType: varchar("sender_type").notNull(), // 'user', 'agent', 'system'
  message: text("message").notNull(),
  messageType: varchar("message_type").default('text'), // 'text', 'file', 'image'
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System health monitoring
export const systemHealth = pgTable("system_health", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  component: varchar("component").notNull(), // 'database', 'auth', 'api', 'notifications'
  status: varchar("status").notNull(), // 'operational', 'degraded', 'down', 'maintenance'
  responseTime: integer("response_time"), // in milliseconds
  uptime: decimal("uptime", { precision: 5, scale: 2 }), // percentage
  errorRate: decimal("error_rate", { precision: 5, scale: 2 }), // percentage
  lastChecked: timestamp("last_checked").defaultNow(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdBy: varchar("created_by").references(() => users.id), // Platform admin who initiated reset
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertPricingTierSchema = createInsertSchema(pricingTiers).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertBillingAuditLogSchema = createInsertSchema(billingAuditLog).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportIntegrationSchema = createInsertSchema(supportIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertSystemHealthSchema = createInsertSchema(systemHealth).omit({
  id: true,
  createdAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
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
export type PricingTier = typeof pricingTiers.$inferSelect;
export type BillingAuditLog = typeof billingAuditLog.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertPricingTier = z.infer<typeof insertPricingTierSchema>;
export type InsertBillingAuditLog = z.infer<typeof insertBillingAuditLogSchema>;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type InsertSupportIntegration = z.infer<typeof insertSupportIntegrationSchema>;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertSystemHealth = z.infer<typeof insertSystemHealthSchema>;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type SupportIntegration = typeof supportIntegrations.$inferSelect;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type SystemHealth = typeof systemHealth.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
