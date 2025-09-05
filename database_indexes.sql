-- Database Performance Optimization Indexes
-- Run these queries in your Neon PostgreSQL database console
-- These indexes will significantly improve query performance

-- Employee related indexes
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_feedback_url ON employees(feedback_url);

-- Feedback related indexes
CREATE INDEX IF NOT EXISTS idx_feedback_employee_id ON feedback(employee_id);
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_by ON feedback(submitted_by);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_id ON feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Performance review indexes
CREATE INDEX IF NOT EXISTS idx_performance_reviews_tenant_id ON performance_reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewer_id ON performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_status ON performance_reviews(status);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_review_date ON performance_reviews(review_date DESC);

-- Goals related indexes
CREATE INDEX IF NOT EXISTS idx_goals_employee_id ON goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_due_date ON goals(due_date);

-- User related indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Tenant related indexes
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_tier ON tenants(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);

-- Department and job position indexes
CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_job_positions_tenant_id ON job_positions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_positions_department_id ON job_positions(department_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Support ticket indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_id ON support_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_by ON support_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant_id ON activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Pricing tier indexes
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_is_active ON pricing_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_display_order ON pricing_tiers(display_order);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_employees_tenant_department ON employees(tenant_id, department_id);
CREATE INDEX IF NOT EXISTS idx_feedback_employee_created ON feedback(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_employee_status ON performance_reviews(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_employee_status ON goals(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);

-- Full text search indexes (if needed)
CREATE INDEX IF NOT EXISTS idx_employees_search ON employees USING gin(to_tsvector('english', 
  coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '')));
CREATE INDEX IF NOT EXISTS idx_feedback_content_search ON feedback USING gin(to_tsvector('english', content));

-- Analyze tables after creating indexes to update statistics
ANALYZE employees;
ANALYZE feedback;
ANALYZE performance_reviews;
ANALYZE goals;
ANALYZE users;
ANALYZE tenants;
ANALYZE departments;
ANALYZE job_positions;
ANALYZE notifications;
ANALYZE support_tickets;
ANALYZE activity_logs;
ANALYZE pricing_tiers;

-- Query to check index usage (run after indexes have been in use)
/*
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
*/

-- Query to identify missing indexes (tables with sequential scans)
/*
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / GREATEST(seq_scan, 1) as avg_tuples_per_scan
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
*/