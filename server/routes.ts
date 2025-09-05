import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import QRCode from 'qrcode';
import { notificationService } from './notificationService';
import { setupAuth, isAuthenticated } from "./replitAuth";
import { requireFeature, addTierInfo } from "./middleware/featureGuard";
import { validateParam, validateTenantAccess, validateUUID, validateURL } from "./validation";
import { insertEmployeeSchema, insertFeedbackSchema, insertTenantSchema, insertPerformanceReviewSchema, insertGoalSchema, type User, type UpsertUser } from "@shared/schema";
import { z } from "zod";

// WebSocket connection management
const wsConnections = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Set storage in app locals for feature guard middleware
  app.locals.storage = storage;
  
  // Auth middleware
  await setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server on /ws path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('🔌 WebSocket connection established');
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication for WebSocket
        if (data.type === 'auth' && data.userId) {
          wsConnections.set(data.userId, ws);
          ws.send(JSON.stringify({ 
            type: 'auth_success', 
            message: 'Connected successfully' 
          }));
          console.log(`✅ User ${data.userId} authenticated via WebSocket`);
        }
        
        // Handle real-time notifications
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
        
      } catch (error) {
        console.error('❌ WebSocket message error:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });

    ws.on('close', () => {
      // Remove connection from map when client disconnects
      wsConnections.forEach((connection, userId) => {
        if (connection === ws) {
          wsConnections.delete(userId);
          console.log(`🔌 User ${userId} disconnected from WebSocket`);
        }
      });
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  });

  // Export WebSocket broadcast function to notification service
  (global as any).broadcastNotification = (userId: string, notification: any) => {
    const connection = wsConnections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
      return true;
    }
    return false;
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get employee data if exists
      const employee = await storage.getEmployeeByUserId(userId);
      const tenant = user.tenantId ? await storage.getTenant(user.tenantId) : null;
      
      res.json({
        ...user,
        employee,
        tenant,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics/:tenantId", isAuthenticated, validateParam('tenantId'), async (req: any, res) => {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Validate tenant access
      const { valid, error } = await validateTenantAccess(userId, tenantId, storage);
      if (!valid) {
        return res.status(403).json({ message: error });
      }
      
      const metrics = await storage.getDashboardMetrics(tenantId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Get recent activity for dashboard
  app.get("/api/dashboard/activity/:tenantId", isAuthenticated, validateParam('tenantId'), async (req: any, res) => {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Validate tenant access
      const { valid, error } = await validateTenantAccess(userId, tenantId, storage);
      if (!valid) {
        return res.status(403).json({ message: error });
      }
      
      const activity = await storage.getRecentActivity(tenantId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching dashboard activity:", error);
      res.status(500).json({ message: "Failed to fetch dashboard activity" });
    }
  });

  // Platform-wide metrics for Platform Super Admins
  app.get("/api/platform/metrics", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      const metrics = await storage.getPlatformMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching platform metrics:", error);
      res.status(500).json({ message: "Failed to fetch platform metrics" });
    }
  });

  // Tenant billing information (Tenant Admin and above)
  app.get("/api/tenant/billing", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (!currentUser || !currentUser.tenantId) {
          return res.status(403).json({ message: "Access denied - No tenant association" });
        }
        
        // Only allow tenant_admin, manager, or platform_admin to access billing
        if (!currentUser.role || !['tenant_admin', 'manager', 'platform_admin'].includes(currentUser.role)) {
          return res.status(403).json({ message: "Access denied - Insufficient permissions" });
        }
        
        const tenant = await storage.getTenant(currentUser.tenantId!);
        if (!tenant) {
          return res.status(404).json({ message: "Tenant not found" });
        }
        
        // Get pricing info for the tenant's tier
        const pricingTiers = [
          { id: 'mj_scott', name: 'MJ Scott', monthlyPrice: 0, yearlyPrice: 0, maxSeats: 10 },
          { id: 'forming', name: 'Forming', monthlyPrice: 5, yearlyPrice: 4, maxSeats: -1 },
          { id: 'storming', name: 'Storming', monthlyPrice: 10, yearlyPrice: 8, maxSeats: -1 },
          { id: 'norming', name: 'Norming', monthlyPrice: 15, yearlyPrice: 12, maxSeats: -1 },
          { id: 'performing', name: 'Performing', monthlyPrice: 20, yearlyPrice: 16, maxSeats: -1 },
          { id: 'appsumo', name: 'AppSumo Lifetime', monthlyPrice: 0, yearlyPrice: 0, maxSeats: -1 }
        ];
        
        const currentTier = pricingTiers.find(tier => tier.id === tenant.subscriptionTier);
        const employeeCount = await storage.getEmployeesByTenant(tenant.id);
        
        res.json({
          tenant: {
            id: tenant.id,
            name: tenant.name,
            domain: tenant.domain,
            subscriptionTier: tenant.subscriptionTier,
            maxEmployees: tenant.maxEmployees,
            isActive: tenant.isActive,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt
          },
          subscription: currentTier,
          usage: {
            currentEmployees: employeeCount.length,
            maxEmployees: tenant.maxEmployees
          }
        });
      }
    } catch (error) {
      console.error("Error fetching tenant billing:", error);
      res.status(500).json({ message: "Failed to fetch tenant billing information" });
    }
  });

  // Platform tenant management for Platform Super Admins
  app.get("/api/platform/tenants", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      console.error("Error fetching platform tenants:", error);
      res.status(500).json({ message: "Failed to fetch platform tenants" });
    }
  });

  // Create new tenant (Platform Admin only)
  app.post("/api/platform/tenants", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      const tenantData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(tenantData);
      res.json(tenant);
    } catch (error) {
      console.error("Error creating tenant:", error);
      res.status(500).json({ message: "Failed to create tenant" });
    }
  });

  // Update tenant (Platform Admin only)
  app.patch("/api/platform/tenants/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      const { id } = req.params;
      const updateData = z.object({
        name: z.string().optional(),
        domain: z.string().optional(),
        subscriptionTier: z.enum(['mj_scott', 'forming', 'storming', 'norming', 'performing', 'appsumo']).optional(),
        maxEmployees: z.number().optional(),
        isActive: z.boolean().optional(),
      }).parse(req.body);
      
      const tenant = await storage.updateTenant(id, updateData);
      res.json(tenant);
    } catch (error) {
      console.error("Error updating tenant:", error);
      res.status(500).json({ message: "Failed to update tenant" });
    }
  });

  // Delete tenant (Platform Admin only)
  app.delete("/api/platform/tenants/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      const { id } = req.params;
      await storage.deleteTenant(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tenant:", error);
      res.status(500).json({ message: "Failed to delete tenant" });
    }
  });

  // Platform Super Admin - Pricing Tier Management Routes
  app.get("/api/platform/pricing-tiers", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const tiers = await storage.getPricingTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching pricing tiers:", error);
      res.status(500).json({ message: "Failed to fetch pricing tiers" });
    }
  });

  app.get("/api/platform/pricing-tiers/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { id } = req.params;
      const tier = await storage.getPricingTier(id);
      if (!tier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      res.json(tier);
    } catch (error) {
      console.error("Error fetching pricing tier:", error);
      res.status(500).json({ message: "Failed to fetch pricing tier" });
    }
  });

  app.post("/api/platform/pricing-tiers", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { insertPricingTierSchema } = await import("@shared/schema");
      const validatedData = insertPricingTierSchema.parse(req.body);
      const tier = await storage.createPricingTier(validatedData);
      
      // Create audit log entry
      await storage.createBillingAuditLog({
        userId: user.claims.sub,
        action: 'tier_create',
        newValue: tier,
        description: `Created new pricing tier: ${tier.name}`,
      });
      
      res.status(201).json(tier);
    } catch (error) {
      console.error("Error creating pricing tier:", error);
      res.status(500).json({ message: "Failed to create pricing tier" });
    }
  });

  app.put("/api/platform/pricing-tiers/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { id } = req.params;
      const { insertPricingTierSchema } = await import("@shared/schema");
      
      // Get old values for audit log
      const oldTier = await storage.getPricingTier(id);
      if (!oldTier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      const validatedData = insertPricingTierSchema.partial().parse(req.body);
      const updatedTier = await storage.updatePricingTier(id, validatedData);
      
      // Create audit log entry
      await storage.createBillingAuditLog({
        userId: user.claims.sub,
        action: 'tier_update',
        oldValue: oldTier,
        newValue: updatedTier,
        description: `Updated pricing tier: ${updatedTier.name}`,
      });
      
      res.json(updatedTier);
    } catch (error) {
      console.error("Error updating pricing tier:", error);
      res.status(500).json({ message: "Failed to update pricing tier" });
    }
  });

  app.delete("/api/platform/pricing-tiers/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { id } = req.params;
      
      // Get tier data for audit log before deletion
      const tier = await storage.getPricingTier(id);
      if (!tier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      await storage.deletePricingTier(id);
      
      // Create audit log entry
      await storage.createBillingAuditLog({
        userId: user.claims.sub,
        action: 'tier_delete',
        oldValue: tier,
        description: `Deleted pricing tier: ${tier.name}`,
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting pricing tier:", error);
      res.status(500).json({ message: "Failed to delete pricing tier" });
    }
  });

  // Platform Super Admin - Tenant Tier Management
  app.put("/api/platform/tenants/:tenantId/tier", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { tenantId } = req.params;
      const { tierId } = req.body;
      
      if (!tierId) {
        return res.status(400).json({ message: "Tier ID is required" });
      }
      
      // Verify the tier exists
      const tier = await storage.getPricingTier(tierId);
      if (!tier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      const updatedTenant = await storage.changeTenantTier(tenantId, tierId, user.claims.sub);
      res.json(updatedTenant);
    } catch (error) {
      console.error("Error changing tenant tier:", error);
      res.status(500).json({ message: "Failed to change tenant tier" });
    }
  });

  // Platform Super Admin - Billing Audit Log
  app.get("/api/platform/billing-audit", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { tenantId, limit } = req.query;
      const auditLog = await storage.getBillingAuditLog(
        tenantId as string || undefined,
        limit ? parseInt(limit as string) : 100
      );
      res.json(auditLog);
    } catch (error) {
      console.error("Error fetching billing audit log:", error);
      res.status(500).json({ message: "Failed to fetch billing audit log" });
    }
  });

  // System Settings Management (Platform Admin only)
  app.get("/api/platform/system-settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { category } = req.query;
      const settings = category 
        ? await storage.getSystemSettingsByCategory(category as string)
        : await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.get("/api/platform/system-settings/:key", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { key } = req.params;
      const setting = await storage.getSystemSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "System setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching system setting:", error);
      res.status(500).json({ message: "Failed to fetch system setting" });
    }
  });

  app.post("/api/platform/system-settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { insertSystemSettingSchema } = await import("@shared/schema");
      const validatedData = insertSystemSettingSchema.parse({
        ...req.body,
        lastModifiedBy: user.claims.sub,
      });
      
      const setting = await storage.upsertSystemSetting(validatedData);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error creating/updating system setting:", error);
      res.status(500).json({ message: "Failed to create/update system setting" });
    }
  });

  app.patch("/api/platform/system-settings/:key", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { key } = req.params;
      const { value } = req.body;
      
      const setting = await storage.updateSystemSetting(key, value, user.claims.sub);
      res.json(setting);
    } catch (error) {
      console.error("Error updating system setting:", error);
      res.status(500).json({ message: "Failed to update system setting" });
    }
  });

  app.delete("/api/platform/system-settings/:key", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { key } = req.params;
      await storage.deleteSystemSetting(key);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting system setting:", error);
      res.status(500).json({ message: "Failed to delete system setting" });
    }
  });

  // Test notification system (Platform Admin only)
  app.post("/api/platform/test-notification", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      
      const { type, email, message } = req.body;
      
      // Test notification functionality
      if (type === 'email') {
        // TODO: Implement email sending with configured SMTP
        console.log(`Test email notification sent to ${email}: ${message}`);
        res.json({ success: true, message: "Email test notification sent successfully" });
      } else if (type === 'sms') {
        // TODO: Implement SMS sending with Twilio
        console.log(`Test SMS notification: ${message}`);
        res.json({ success: true, message: "SMS test notification sent successfully" });
      } else {
        res.status(400).json({ message: "Invalid notification type" });
      }
    } catch (error) {
      console.error("Error testing notification:", error);
      res.status(500).json({ message: "Failed to test notification" });
    }
  });

  // Get all users for testing (Platform Admin only)
  app.get("/api/platform/users", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      const users = await storage.getAllUsersWithTenants();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch all users" });
    }
  });

  // User CRUD operations (Platform Admin only)
  app.post("/api/platform/users", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      const userData = z.object({
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
        role: z.enum(['platform_admin', 'tenant_admin', 'manager', 'employee']),
        tenantId: z.string().optional(),
        profileImageUrl: z.string().optional(),
      }).parse(req.body);
      
      const newUser = await storage.createUser(userData);
      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/platform/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      const { id } = req.params;
      const updateData = z.object({
        email: z.string().email().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        role: z.enum(['platform_admin', 'tenant_admin', 'manager', 'employee']).optional(),
        tenantId: z.string().optional(),
        profileImageUrl: z.string().optional(),
      }).parse(req.body);
      
      const updatedUser = await storage.updateUser(id, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/platform/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Login as user for testing (Platform Admin only)
  app.post("/api/platform/login-as-user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role !== 'platform_admin') {
          return res.status(403).json({ message: "Access denied - Platform Admin required" });
        }
      }
      const { userId } = req.body;
      
      // Validate userId format
      if (!userId || !validateUUID(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create session for target user
      const userSession = {
        claims: {
          sub: targetUser.id,
          email: targetUser.email,
          first_name: targetUser.firstName,
          last_name: targetUser.lastName,
          profile_image_url: targetUser.profileImageUrl || null,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        },
        access_token: 'dev-token',
        refresh_token: 'dev-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
      };
      
      req.logIn(userSession, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: "Login failed" });
        }
        res.json({ success: true, user: userSession.claims });
      });
    } catch (error) {
      console.error("Error logging in as user:", error);
      res.status(500).json({ message: "Failed to login as user" });
    }
  });

  // Employee management routes
  app.get("/api/employees/:tenantId", isAuthenticated, validateParam('tenantId'), async (req: any, res) => {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Validate tenant access
      const { valid, error } = await validateTenantAccess(userId, tenantId, storage);
      if (!valid) {
        return res.status(403).json({ message: error });
      }
      
      const employees = await storage.getEmployeesByTenant(tenantId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      const currentUser = await storage.getUser(userId);
      
      // Check if user exists and has permission to create employees (only tenant_admin and manager)
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!currentUser.role || !['tenant_admin', 'manager'].includes(currentUser.role)) {
        return res.status(403).json({ 
          message: "Access denied - Only tenant administrators and managers can add employees" 
        });
      }

      const employeeData = insertEmployeeSchema.parse(req.body);
      
      // Use the current user's tenant ID to ensure proper tenant isolation
      const tenantId = currentUser.tenantId;
      if (!tenantId) {
        return res.status(400).json({ message: "User must belong to a tenant" });
      }
      
      // Check subscription limits and create employee atomically
      const tenant = await storage.getTenant(tenantId as string);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      const maxEmployees = tenant.maxEmployees || 25; // Default to 25 if null
      
      // Use atomic employee creation with subscription limit check
      const employee = await (storage as any).createEmployeeWithLimitCheck({
        ...employeeData,
        tenantId: tenantId as string,
      }, maxEmployees);
      
      res.json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Feedback routes
  app.get("/api/feedback/:employeeId", isAuthenticated, validateParam('employeeId'), async (req, res) => {
    try {
      const { employeeId } = req.params;
      const feedbacks = await storage.getFeedbacksByEmployee(employeeId);
      res.json(feedbacks);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Goals routes
  app.get("/api/goals/:employeeId", isAuthenticated, validateParam('employeeId'), async (req, res) => {
    try {
      const { employeeId } = req.params;
      const goals = await storage.getGoalsByEmployee(employeeId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Get goals for specific employee (alternative endpoint)
  app.get("/api/employee/:employeeId/goals", isAuthenticated, validateParam('employeeId'), async (req, res) => {
    try {
      const { employeeId } = req.params;
      const goals = await storage.getGoalsByEmployee(employeeId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching employee goals:", error);
      res.status(500).json({ message: "Failed to fetch employee goals" });
    }
  });

  // Performance Review routes
  
  // Get performance reviews for a tenant (for managers/admins)
  app.get("/api/performance-reviews/:tenantId", isAuthenticated, validateParam('tenantId'), async (req: any, res) => {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Validate tenant access
      const { valid, error } = await validateTenantAccess(userId, tenantId, storage);
      if (!valid) {
        return res.status(403).json({ message: error });
      }
      
      const reviews = await storage.getPerformanceReviewsByTenant(tenantId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching performance reviews:", error);
      res.status(500).json({ message: "Failed to fetch performance reviews" });
    }
  });
  
  // Department management routes
  app.get("/api/departments/:tenantId", isAuthenticated, validateParam('tenantId'), async (req: any, res) => {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Validate tenant access
      const { valid, error } = await validateTenantAccess(userId, tenantId, storage);
      if (!valid) {
        return res.status(403).json({ message: error });
      }
      
      const departments = await storage.getDepartmentsByTenant(tenantId);
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post("/api/departments", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      const currentUser = await storage.getUser(userId);
      
      // Check permissions
      if (!currentUser || !['tenant_admin', 'manager'].includes(currentUser.role || '')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const departmentData = req.body;
      const department = await storage.createDepartment(departmentData);
      res.json(department);
    } catch (error) {
      console.error("Error creating department:", error);
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  // Job position management routes
  app.get("/api/job-positions/:tenantId", isAuthenticated, validateParam('tenantId'), async (req: any, res) => {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Validate tenant access
      const { valid, error } = await validateTenantAccess(userId, tenantId, storage);
      if (!valid) {
        return res.status(403).json({ message: error });
      }
      
      const jobPositions = await storage.getJobPositionsByTenant(tenantId);
      res.json(jobPositions);
    } catch (error) {
      console.error("Error fetching job positions:", error);
      res.status(500).json({ message: "Failed to fetch job positions" });
    }
  });

  app.post("/api/job-positions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      const currentUser = await storage.getUser(userId);
      
      // Check permissions
      if (!currentUser || !['tenant_admin', 'manager'].includes(currentUser.role || '')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const jobPositionData = req.body;
      const jobPosition = await storage.createJobPosition(jobPositionData);
      res.json(jobPosition);
    } catch (error) {
      console.error("Error creating job position:", error);
      res.status(500).json({ message: "Failed to create job position" });
    }
  });

  // Bulk employee operations
  app.post("/api/employees/bulk-assign-department", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      const currentUser = await storage.getUser(userId);
      
      // Check permissions
      if (!currentUser || !['tenant_admin', 'manager'].includes(currentUser.role || '')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { employeeIds, departmentId } = req.body;
      const updatedEmployees = await storage.bulkAssignDepartment(employeeIds, departmentId);
      res.json(updatedEmployees);
    } catch (error) {
      console.error("Error in bulk department assignment:", error);
      res.status(500).json({ message: "Failed to assign department" });
    }
  });

  app.post("/api/employees/bulk-assign-manager", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      const currentUser = await storage.getUser(userId);
      
      // Check permissions
      if (!currentUser || !['tenant_admin', 'manager'].includes(currentUser.role || '')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { employeeIds, managerId } = req.body;
      const updatedEmployees = await storage.bulkAssignManager(employeeIds, managerId);
      res.json(updatedEmployees);
    } catch (error) {
      console.error("Error in bulk manager assignment:", error);
      res.status(500).json({ message: "Failed to assign manager" });
    }
  });

  // Employee search and hierarchy
  app.get("/api/employees/:tenantId/search", isAuthenticated, validateParam('tenantId'), async (req: any, res) => {
    try {
      const { tenantId } = req.params;
      const { query, departmentId, status, managerId } = req.query;
      const userId = req.user?.claims?.sub;
      
      // Validate tenant access
      const { valid, error } = await validateTenantAccess(userId, tenantId, storage);
      if (!valid) {
        return res.status(403).json({ message: error });
      }
      
      const filters = { departmentId, status, managerId };
      const employees = await storage.searchEmployees(tenantId, query || '', filters);
      res.json(employees);
    } catch (error) {
      console.error("Error searching employees:", error);
      res.status(500).json({ message: "Failed to search employees" });
    }
  });

  app.get("/api/employees/:employeeId/hierarchy", isAuthenticated, validateParam('employeeId'), async (req: any, res) => {
    try {
      const { employeeId } = req.params;
      const hierarchy = await storage.getEmployeeHierarchy(employeeId);
      res.json(hierarchy);
    } catch (error) {
      console.error("Error fetching employee hierarchy:", error);
      res.status(500).json({ message: "Failed to fetch employee hierarchy" });
    }
  });

  // Get performance reviews for a specific employee
  app.get("/api/employee/:employeeId/performance-reviews", isAuthenticated, validateParam('employeeId'), async (req: any, res) => {
    try {
      const { employeeId } = req.params;
      const reviews = await storage.getPerformanceReviewsByEmployee(employeeId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching employee performance reviews:", error);
      res.status(500).json({ message: "Failed to fetch employee performance reviews" });
    }
  });

  // Get a specific performance review
  app.get("/api/performance-review/:reviewId", isAuthenticated, validateParam('reviewId'), async (req: any, res) => {
    try {
      const { reviewId } = req.params;
      const review = await storage.getPerformanceReview(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Performance review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error fetching performance review:", error);
      res.status(500).json({ message: "Failed to fetch performance review" });
    }
  });

  // Create a new performance review
  app.post("/api/performance-reviews", isAuthenticated, async (req: any, res) => {
    try {
      const reviewData = insertPerformanceReviewSchema.parse(req.body);
      const review = await storage.createPerformanceReview(reviewData);
      
      // Send notification to employee about new performance review
      try {
        const employee = await storage.getEmployee(review.employeeId);
        if (employee) {
          const employeeUser = employee.userId ? await storage.getUser(employee.userId) : null;
          if (employeeUser) {
            await notificationService.sendNotification(
              employeeUser.id,
              'performance_review',
              '📊 New Performance Review',
              `A new performance review has been created for the period: ${review.reviewPeriod}`,
              { reviewId: review.id, employeeId: employee.id }
            );
          }
        }
      } catch (notificationError) {
        console.error("Error sending performance review notification:", notificationError);
      }
      
      res.json(review);
    } catch (error) {
      console.error("Error creating performance review:", error);
      res.status(500).json({ message: "Failed to create performance review" });
    }
  });

  // Update a performance review
  app.put("/api/performance-review/:reviewId", isAuthenticated, validateParam('reviewId'), async (req: any, res) => {
    try {
      const { reviewId } = req.params;
      const updateData = insertPerformanceReviewSchema.partial().parse(req.body);
      const review = await storage.updatePerformanceReview(reviewId, updateData);
      res.json(review);
    } catch (error) {
      console.error("Error updating performance review:", error);
      res.status(500).json({ message: "Failed to update performance review" });
    }
  });

  // Delete a performance review
  app.delete("/api/performance-review/:reviewId", isAuthenticated, validateParam('reviewId'), async (req: any, res) => {
    try {
      const { reviewId } = req.params;
      await storage.deletePerformanceReview(reviewId);
      res.json({ message: "Performance review deleted successfully" });
    } catch (error) {
      console.error("Error deleting performance review:", error);
      res.status(500).json({ message: "Failed to delete performance review" });
    }
  });

  // Departments routes
  app.get("/api/departments/:tenantId", isAuthenticated, validateParam('tenantId'), async (req: any, res) => {
    try {
      const { tenantId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Validate tenant access
      const { valid, error } = await validateTenantAccess(userId, tenantId, storage);
      if (!valid) {
        return res.status(403).json({ message: error });
      }
      
      const departments = await storage.getDepartmentsByTenant(tenantId);
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  // Universal feedback link (public, no auth required)
  app.get("/feedback/:feedbackUrl", async (req, res) => {
    try {
      const { feedbackUrl } = req.params;
      
      // Basic validation for feedback URL format (alphanumeric and dashes)
      if (!feedbackUrl || !/^[a-zA-Z0-9-_]{8,}$/.test(feedbackUrl)) {
        return res.status(400).json({ message: "Invalid feedback URL format" });
      }
      
      const employee = await storage.getEmployeeByFeedbackUrl(feedbackUrl);
      if (!employee) {
        return res.status(404).json({ message: "Feedback link not found" });
      }
      res.json({ employee, tenant: await storage.getTenant(employee.tenantId) });
    } catch (error) {
      console.error("Error fetching feedback link:", error);
      res.status(500).json({ message: "Failed to fetch feedback link" });
    }
  });

  // Submit feedback via universal link (public, no auth required)
  app.post("/feedback/:feedbackUrl/submit", async (req, res) => {
    try {
      const { feedbackUrl } = req.params;
      
      // Basic validation for feedback URL format
      if (!feedbackUrl || !/^[a-zA-Z0-9-_]{8,}$/.test(feedbackUrl)) {
        return res.status(400).json({ message: "Invalid feedback URL format" });
      }
      
      const employee = await storage.getEmployeeByFeedbackUrl(feedbackUrl);
      if (!employee) {
        return res.status(404).json({ message: "Feedback link not found" });
      }
      
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        employeeId: employee.id
      });
      const feedback = await storage.createFeedback(feedbackData);
      
      // Send notification to employee about new feedback received
      try {
        const employeeUser = employee.userId ? await storage.getUser(employee.userId) : null;
        if (employeeUser) {
          await notificationService.sendNotification(
            employeeUser.id,
            'feedback_received',
            '📝 New Feedback Received',
            `You've received new feedback: "${(feedback.comments || '').slice(0, 100)}${(feedback.comments || '').length > 100 ? '...' : ''}"`,
            { feedbackId: feedback.id, employeeId: employee.id }
          );
        }
      } catch (notificationError) {
        console.error("Error sending feedback notification:", notificationError);
      }
      
      res.json(feedback);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Get pricing tier information
  app.get("/api/platform/pricing-tiers", async (req, res) => {
    try {
      const pricingTiers = [
        {
          id: 'mj_scott',
          name: 'MJ Scott',
          monthlyPrice: 0,
          yearlyPrice: 0,
          maxSeats: 10,
          features: ['Basic HR Management', 'Employee Profiles', 'Basic Reporting', 'Email Support'],
          targetMarket: 'VIP/Special Access'
        },
        {
          id: 'forming',
          name: 'Forming',
          monthlyPrice: 5,
          yearlyPrice: 4,
          maxSeats: -1,
          features: ['Core Performance Management', '360° Feedback', 'Goal Tracking', 'Basic Analytics', 'QR Code Feedback'],
          targetMarket: 'Small teams starting performance management (1-25)'
        },
        {
          id: 'storming',
          name: 'Storming',
          monthlyPrice: 10,
          yearlyPrice: 8,
          maxSeats: -1,
          features: ['Everything in Forming', 'Advanced Performance Reviews', 'Team Collaboration Tools', 'Custom Performance Criteria', 'Priority Support', 'Advanced Reporting'],
          targetMarket: 'Growing companies with structured processes (25-100)'
        },
        {
          id: 'norming',
          name: 'Norming',
          monthlyPrice: 15,
          yearlyPrice: 12,
          maxSeats: -1,
          features: ['Everything in Storming', 'Enterprise Analytics', 'Multi-Department Management', 'Custom Workflows', 'API Access', 'Dedicated Account Manager'],
          targetMarket: 'Established businesses with complex needs (100-500)'
        },
        {
          id: 'performing',
          name: 'Performing',
          monthlyPrice: 20,
          yearlyPrice: 16,
          maxSeats: -1,
          features: ['Everything in Norming', 'Full Enterprise Suite', 'Custom Integrations', 'Advanced Security & Compliance', 'White-label Options', 'Premium Support & Training'],
          targetMarket: 'Large enterprises with advanced requirements (500+)'
        },
        {
          id: 'appsumo',
          name: 'AppSumo Lifetime',
          monthlyPrice: 0,
          yearlyPrice: 0,
          maxSeats: -1,
          features: ['Core Performance Management', '360° Feedback', 'Goal Tracking', 'Basic Analytics', 'QR Code Feedback', 'Lifetime Access'],
          targetMarket: 'AppSumo deal purchasers'
        }
      ];
      res.json(pricingTiers);
    } catch (error) {
      console.error("Error fetching pricing tiers:", error);
      res.status(500).json({ message: "Failed to fetch pricing tiers" });
    }
  });

  // Notification endpoints
  
  // Get user notifications
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Delete notification
  app.delete('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(id);
      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Get user notification preferences
  app.get('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let preferences = await storage.getUserNotificationPreferences(userId);
      
      // Create default preferences if none exist
      if (!preferences) {
        preferences = await storage.upsertNotificationPreferences({
          userId,
          emailNotifications: true,
          pushNotifications: true,
          feedbackNotifications: true,
          goalReminders: true,
          weeklyDigest: false,
        });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  // Update notification preferences
  app.put('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate preferences data
      const preferencesSchema = z.object({
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        feedbackNotifications: z.boolean().optional(),
        goalReminders: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
      });
      
      const validatedData = preferencesSchema.parse(req.body);
      const preferencesData = {
        userId,
        ...validatedData,
      };
      
      const preferences = await storage.upsertNotificationPreferences(preferencesData);
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preferences data", errors: error.errors });
      }
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Test notification endpoint (for system admins)
  app.post('/api/notifications/test', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'platform_admin') {
        return res.status(403).json({ message: "Access denied - Platform admin only" });
      }
      
      await notificationService.sendNotification(
        userId,
        'system_update',
        '🧪 Test Notification',
        'This is a test notification to verify the notification system is working correctly.',
        { test: true }
      );
      
      res.json({ message: "Test notification sent successfully" });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  // Get notification system status
  app.get('/api/notifications/status', isAuthenticated, async (req, res) => {
    try {
      const health = await notificationService.healthCheck();
      const stats = await notificationService.getNotificationStats();
      
      res.json({
        ...health,
        ...stats,
        status: 'operational'
      });
    } catch (error) {
      console.error("Error fetching notification status:", error);
      res.status(500).json({ message: "Failed to fetch notification status" });
    }
  });

  // QR Code generation
  app.post('/api/generate-qr', isAuthenticated, async (req: any, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: 'URL is required' });
      }
      
      // Validate URL format for security
      if (!validateURL(url)) {
        return res.status(400).json({ message: 'Invalid URL format' });
      }
      
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      res.json({ qrCode: qrCodeDataURL });
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ message: 'Failed to generate QR code' });
    }
  });

  // Get current user's employee data
  app.get('/api/user/employee', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      if (!employee) {
        return res.status(404).json({ message: 'Employee record not found' });
      }
      res.json(employee);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      res.status(500).json({ message: 'Failed to fetch employee data' });
    }
  });

  // Get current user's complete performance data (employee + goals + feedback)
  app.get('/api/user/performance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployeeByUserId(userId);
      if (!employee) {
        return res.status(404).json({ message: 'Employee record not found' });
      }

      // Fetch goals and feedback in parallel
      const [goals, feedback] = await Promise.all([
        storage.getGoalsByEmployee(employee.id),
        storage.getFeedbacksByEmployee(employee.id)
      ]);

      res.json({
        employee,
        goals,
        feedback
      });
    } catch (error) {
      console.error('Error fetching performance data:', error);
      res.status(500).json({ message: 'Failed to fetch performance data' });
    }
  });

  // Get employee feedback
  app.get('/api/employee/:employeeId/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId } = req.params;
      const feedback = await storage.getFeedbacksByEmployee(employeeId);
      res.json(feedback);
    } catch (error) {
      console.error('Error fetching employee feedback:', error);
      res.status(500).json({ message: 'Failed to fetch employee feedback' });
    }
  });

  // Get employee goals
  app.get('/api/employee/:employeeId/goals', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId } = req.params;
      const goals = await storage.getGoalsByEmployee(employeeId);
      res.json(goals);
    } catch (error) {
      console.error('Error fetching employee goals:', error);
      res.status(500).json({ message: 'Failed to fetch employee goals' });
    }
  });

  // Create new goal for employee
  app.post('/api/employee/:employeeId/goals', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId } = req.params;
      const goalData = insertGoalSchema.parse({
        ...req.body,
        employeeId,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : (req.body.deadline ? new Date(req.body.deadline) : null)
      });
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ message: 'Failed to create goal' });
    }
  });

  // ========== SUPPORT SYSTEM ROUTES ==========

  // Support Tickets Management
  app.get("/api/support/tickets", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      
      // Platform admins can see all tickets, others see only their tenant's tickets
      const tenantId = currentUser?.role === 'platform_admin' ? undefined : currentUser?.tenantId;
      const tickets = await storage.getSupportTickets(tenantId as string);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.post("/api/support/tickets", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      
      const { insertSupportTicketSchema } = await import("@shared/schema");
      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        userId: user.claims.sub,
        tenantId: currentUser?.tenantId,
      });
      
      const ticket = await storage.createSupportTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.patch("/api/support/tickets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const ticket = await storage.updateSupportTicket(id, updateData);
      res.json(ticket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });

  // Support Integrations Management (Platform Admin only)
  app.get("/api/support/integrations", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      if (currentUser?.role !== 'platform_admin') {
        return res.status(403).json({ message: "Access denied - Platform Admin required" });
      }
      
      const integrations = await storage.getSupportIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching support integrations:", error);
      res.status(500).json({ message: "Failed to fetch support integrations" });
    }
  });

  app.post("/api/support/integrations", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      if (currentUser?.role !== 'platform_admin') {
        return res.status(403).json({ message: "Access denied - Platform Admin required" });
      }
      
      const { insertSupportIntegrationSchema } = await import("@shared/schema");
      const integrationData = insertSupportIntegrationSchema.parse({
        ...req.body,
        configuredBy: user.claims.sub,
      });
      
      const integration = await storage.createSupportIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating support integration:", error);
      res.status(500).json({ message: "Failed to create support integration" });
    }
  });

  // Knowledge Base Management
  app.get("/api/knowledge-base", async (req: any, res) => {
    try {
      const { category } = req.query;
      const articles = await storage.getKnowledgeBaseArticles(category);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching knowledge base articles:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base articles" });
    }
  });

  app.get("/api/knowledge-base/:slug", async (req: any, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getKnowledgeBaseArticle(slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Increment view count
      await storage.incrementKnowledgeBaseViews(article.id);
      res.json(article);
    } catch (error) {
      console.error("Error fetching knowledge base article:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base article" });
    }
  });

  app.post("/api/knowledge-base", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      if (!['platform_admin', 'tenant_admin'].includes(currentUser?.role || '')) {
        return res.status(403).json({ message: "Access denied - Admin required" });
      }
      
      const { insertKnowledgeBaseSchema } = await import("@shared/schema");
      const articleData = insertKnowledgeBaseSchema.parse({
        ...req.body,
        authorId: user.claims.sub,
      });
      
      const article = await storage.createKnowledgeBaseArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating knowledge base article:", error);
      res.status(500).json({ message: "Failed to create knowledge base article" });
    }
  });

  // Live Chat System
  app.post("/api/chat/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      
      const { insertChatSessionSchema } = await import("@shared/schema");
      const sessionData = insertChatSessionSchema.parse({
        userId: user.claims.sub,
        tenantId: currentUser?.tenantId,
        status: 'waiting',
      });
      
      const session = await storage.createChatSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get("/api/chat/sessions/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getChatMessages(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/sessions/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user as any;
      
      const { insertChatMessageSchema } = await import("@shared/schema");
      const messageData = insertChatMessageSchema.parse({
        sessionId: id,
        senderId: user.claims.sub,
        senderType: 'user',
        message: req.body.message,
      });
      
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  // System Health Monitoring
  app.get("/api/system/health", async (req: any, res) => {
    try {
      const healthStatus = await storage.getSystemHealthStatus();
      res.json(healthStatus);
    } catch (error) {
      console.error("Error fetching system health:", error);
      res.status(500).json({ message: "Failed to fetch system health" });
    }
  });

  app.post("/api/system/health", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      if (currentUser?.role !== 'platform_admin') {
        return res.status(403).json({ message: "Access denied - Platform Admin required" });
      }
      
      const { insertSystemHealthSchema } = await import("@shared/schema");
      const healthData = insertSystemHealthSchema.parse(req.body);
      
      const health = await storage.updateSystemHealth(healthData);
      res.json(health);
    } catch (error) {
      console.error("Error updating system health:", error);
      res.status(500).json({ message: "Failed to update system health" });
    }
  });

  // Password Reset Management (Platform Admin only)
  app.post("/api/admin/password-reset", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      if (currentUser?.role !== 'platform_admin') {
        return res.status(403).json({ message: "Access denied - Platform Admin required" });
      }
      
      const { userId } = req.body;
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate password reset token
      const { randomUUID } = require('crypto');
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      const { insertPasswordResetTokenSchema } = await import("@shared/schema");
      const tokenData = insertPasswordResetTokenSchema.parse({
        userId,
        token,
        expiresAt,
        createdBy: user.claims.sub,
      });
      
      const resetToken = await storage.createPasswordResetToken(tokenData);
      
      // TODO: Send reset token via email
      console.log(`Password reset token generated for ${targetUser.email}: ${token}`);
      
      res.json({ success: true, message: "Password reset token generated" });
    } catch (error) {
      console.error("Error generating password reset token:", error);
      res.status(500).json({ message: "Failed to generate password reset token" });
    }
  });

  // Discount code management routes (Platform Admin only)
  app.get('/api/platform/discount-codes', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'platform_admin') {
        return res.status(403).json({ message: 'Platform admin access required' });
      }

      const codes = await storage.getDiscountCodes();
      res.json(codes);
    } catch (error) {
      console.error("Error fetching discount codes:", error);
      res.status(500).json({ message: "Failed to fetch discount codes" });
    }
  });

  app.post('/api/platform/discount-codes', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'platform_admin') {
        return res.status(403).json({ message: 'Platform admin access required' });
      }

      const codeData = {
        ...req.body,
        createdBy: user.id,
      };

      const code = await storage.createDiscountCode(codeData);
      res.status(201).json(code);
    } catch (error) {
      console.error("Error creating discount code:", error);
      res.status(500).json({ message: "Failed to create discount code" });
    }
  });

  app.patch('/api/platform/discount-codes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'platform_admin') {
        return res.status(403).json({ message: 'Platform admin access required' });
      }

      const { id } = req.params;
      const code = await storage.updateDiscountCode(id, req.body);
      res.json(code);
    } catch (error) {
      console.error("Error updating discount code:", error);
      res.status(500).json({ message: "Failed to update discount code" });
    }
  });

  app.get('/api/platform/discount-codes/:id/usage', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'platform_admin') {
        return res.status(403).json({ message: 'Platform admin access required' });
      }

      const { id } = req.params;
      const usage = await storage.getDiscountUsagesByCode(id);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching discount usage:", error);
      res.status(500).json({ message: "Failed to fetch discount usage" });
    }
  });

  // Discount code validation (public for checkout)
  app.post('/api/validate-discount', async (req, res) => {
    try {
      const { code, userId } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: 'Discount code is required' });
      }

      const validation = await storage.validateDiscountCode(code, userId);
      res.json(validation);
    } catch (error) {
      console.error("Error validating discount code:", error);
      res.status(500).json({ message: "Failed to validate discount code" });
    }
  });

  // Apply discount code during checkout
  app.post('/api/apply-discount', isAuthenticated, async (req: any, res) => {
    try {
      const { discountCodeId, orderValue, stripeInvoiceId } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      const discountCode = await storage.getDiscountCodeById(discountCodeId);
      if (!discountCode) {
        return res.status(404).json({ message: 'Discount code not found' });
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (discountCode.discountType === 'percentage') {
        discountAmount = Math.round((orderValue * discountCode.discountValue) / 100);
      } else if (discountCode.discountType === 'fixed_amount') {
        discountAmount = discountCode.discountValue;
      }

      // Record usage
      const usage = await storage.recordDiscountUsage({
        discountCodeId,
        userId,
        tenantId: user?.tenantId || null,
        orderValue,
        discountAmount,
        stripeInvoiceId,
      });

      res.json({ usage, discountAmount });
    } catch (error) {
      console.error("Error applying discount:", error);
      res.status(500).json({ message: "Failed to apply discount" });
    }
  });

  // Referral system routes
  app.get('/api/user/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getReferralsByUser(userId);
      const stats = await storage.getReferralStats(userId);
      const rewards = await storage.getReferralRewardsByUser(userId);

      res.json({ referrals, stats, rewards });
    } catch (error) {
      console.error("Error fetching user referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.post('/api/user/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { referredEmail, campaignName } = req.body;

      // Generate unique referral code
      const referralCode = await storage.generateReferralCode(userId);

      const referral = await storage.createReferral({
        referrerUserId: userId,
        referredEmail,
        referralCode,
        campaignName: campaignName || 'default',
        rewardType: 'discount',
        rewardValue: 2000, // $20 in cents
      });

      res.status(201).json(referral);
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ message: "Failed to create referral" });
    }
  });

  // Complete referral when referred user signs up
  app.post('/api/complete-referral', async (req, res) => {
    try {
      const { referralCode, referredUserId } = req.body;

      if (!referralCode || !referredUserId) {
        return res.status(400).json({ message: 'Referral code and referred user ID are required' });
      }

      const referral = await storage.completeReferral(referralCode, referredUserId);
      
      // Create rewards for both referrer and referred user
      const referrerReward = await storage.createReferralReward({
        referralId: referral.id,
        userId: referral.referrerUserId,
        rewardType: 'referrer_bonus',
        rewardValue: referral.rewardValue || 2000,
        rewardDescription: 'Referral bonus - friend signed up',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      });

      const referredReward = await storage.createReferralReward({
        referralId: referral.id,
        userId: referredUserId,
        rewardType: 'referee_discount',
        rewardValue: 1000, // $10 discount for new user
        rewardDescription: 'Welcome discount from referral',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      });

      res.json({ referral, referrerReward, referredReward });
    } catch (error) {
      console.error("Error completing referral:", error);
      res.status(500).json({ message: "Failed to complete referral" });
    }
  });

  // Apply referral reward to invoice
  app.post('/api/apply-referral-reward', isAuthenticated, async (req: any, res) => {
    try {
      const { rewardId, stripeInvoiceId } = req.body;
      const userId = req.user.claims.sub;

      // Verify the reward belongs to the user
      const rewards = await storage.getReferralRewardsByUser(userId);
      const reward = rewards.find(r => r.id === rewardId);

      if (!reward) {
        return res.status(404).json({ message: 'Reward not found' });
      }

      if (reward.appliedAt) {
        return res.status(400).json({ message: 'Reward already applied' });
      }

      const updatedReward = await storage.markReferralRewardApplied(rewardId, stripeInvoiceId);
      res.json(updatedReward);
    } catch (error) {
      console.error("Error applying referral reward:", error);
      res.status(500).json({ message: "Failed to apply referral reward" });
    }
  });

  // Platform admin - view all referrals
  app.get('/api/platform/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'platform_admin') {
        return res.status(403).json({ message: 'Platform admin access required' });
      }

      // This would need a new storage method to get all referrals
      // For now, return empty array as placeholder
      res.json([]);
    } catch (error) {
      console.error("Error fetching platform referrals:", error);
      res.status(500).json({ message: "Failed to fetch platform referrals" });
    }
  });

  // Subscription tier information endpoint
  app.get("/api/subscription/tier-info", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      
      const currentUser = await storage.getUser(userId);
      if (!currentUser || !currentUser.tenantId) {
        return res.status(404).json({ message: "User or tenant not found" });
      }

      const tenant = await storage.getTenant(currentUser.tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // Import the tier info function
      const { getTierInfo } = await import('./subscriptionFeatures');
      const tierInfo = getTierInfo((tenant.subscriptionTier as any) || 'forming');
      
      res.json(tierInfo);
    } catch (error) {
      console.error("Error fetching tier info:", error);
      res.status(500).json({ message: "Failed to fetch subscription tier information" });
    }
  });

  // Website customization endpoints
  app.get("/api/website-settings/:tenantId", isAuthenticated, validateParam('tenantId'), async (req: any, res) => {
    try {
      const { tenantId } = req.params;
      
      // Validate tenant access
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      
      const validationResult = await validateTenantAccess(userId, tenantId, storage);
      if (!validationResult.valid) {
        return res.status(403).json({ message: validationResult.error });
      }

      const settings = await storage.getWebsiteSettings(tenantId);
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching website settings:", error);
      res.status(500).json({ message: "Failed to fetch website settings" });
    }
  });

  app.post("/api/website-settings", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      
      const currentUser = await storage.getUser(userId);
      if (!currentUser?.tenantId) {
        return res.status(404).json({ message: "User or tenant not found" });
      }

      // Only allow tenant admins and platform admins to modify website settings
      if (currentUser.role !== 'tenant_admin' && currentUser.role !== 'platform_admin') {
        return res.status(403).json({ message: "Only administrators can modify website settings" });
      }

      const settingsData = {
        tenantId: currentUser.tenantId,
        ...req.body
      };

      const settings = await storage.upsertWebsiteSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating website settings:", error);
      res.status(500).json({ message: "Failed to update website settings" });
    }
  });

  app.patch("/api/website-settings/:tenantId", isAuthenticated, validateParam('tenantId'), async (req: any, res) => {
    try {
      const { tenantId } = req.params;
      
      // Validate tenant access
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      
      const validationResult = await validateTenantAccess(userId, tenantId, storage);
      if (!validationResult.valid) {
        return res.status(403).json({ message: validationResult.error });
      }

      // Only allow tenant admins and platform admins to modify website settings
      const currentUser = await storage.getUser(userId);
      if (currentUser?.role !== 'tenant_admin' && currentUser?.role !== 'platform_admin') {
        return res.status(403).json({ message: "Only administrators can modify website settings" });
      }

      const settings = await storage.updateWebsiteSettings(tenantId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating website settings:", error);
      res.status(500).json({ message: "Failed to update website settings" });
    }
  });

  // ========== AI BEHAVIORAL INTELLIGENCE ROUTES ==========
  
  // Check if user has access to AI features (premium tiers only)
  const hasAIAccess = (user: any): boolean => {
    if (!user?.employee?.tenant?.subscriptionTier) return false;
    const tier = user.employee.tenant.subscriptionTier;
    // AI features available for Norming, Performing, AppSumo tiers
    return ['norming', 'performing', 'appsumo'].includes(tier.toLowerCase());
  };

  // Generate behavioral analysis for an employee (premium feature)
  app.post('/api/ai/analyze-employee/:employeeId', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      
      if (!hasAIAccess(currentUser)) {
        return res.status(403).json({ 
          message: "AI features are available for Norming, Performing, and AppSumo subscription tiers",
          upgradeRequired: true 
        });
      }

      const { employeeId } = req.params;
      
      // Get employee data for analysis
      const [employee, feedbacks, goals] = await Promise.all([
        storage.getEmployee(employeeId),
        storage.getFeedbacksByEmployee(employeeId),
        storage.getGoalsByEmployee(employeeId)
      ]);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Import AI service
      const { generateBehavioralInsights } = await import('./ai/claude');
      
      // Generate comprehensive behavioral analysis
      const insights = await generateBehavioralInsights(
        employeeId,
        feedbacks,
        goals,
        [] // collaboration data - can be expanded
      );

      // Save analysis to database
      await storage.createBehavioralAnalysis({
        employeeId,
        tenantId: employee.tenantId,
        analysisType: 'comprehensive',
        scores: insights.leadership,
        insights: {
          collaboration: insights.collaboration,
          sentiment: insights.sentiment,
          overallAssessment: insights.overallAssessment
        },
        dataSourceIds: [...feedbacks.map(f => f.id), ...goals.map(g => g.id)],
        confidenceLevel: Math.round((insights.sentiment.confidence + 0.8) * 50) // Convert to 0-100
      });

      // Update or create rising star candidate if score is high
      if (insights.leadership.overallRisingStarScore >= 75) {
        const existingCandidates = await storage.getRisingStarCandidates(employee.tenantId);
        const existing = existingCandidates.find(c => c.employeeId === employeeId);
        
        if (existing) {
          await storage.updateRisingStarCandidate(existing.id, {
            overallScore: insights.leadership.overallRisingStarScore,
            leadershipReadiness: insights.leadership.leadershipReadiness,
            collaborationScore: insights.collaboration.collaborationScore,
            initiativeScore: insights.leadership.initiativeScore,
            knowledgeSharingIndex: insights.leadership.knowledgeSharingIndex,
            crossDepartmentImpact: insights.leadership.crossDepartmentImpact,
            recommendedActions: insights.leadership.recommendedActions,
            lastAnalyzedAt: new Date()
          });
        } else {
          await storage.createRisingStarCandidate({
            employeeId,
            tenantId: employee.tenantId,
            overallScore: insights.leadership.overallRisingStarScore,
            leadershipReadiness: insights.leadership.leadershipReadiness,
            collaborationScore: insights.collaboration.collaborationScore,
            initiativeScore: insights.leadership.initiativeScore,
            knowledgeSharingIndex: insights.leadership.knowledgeSharingIndex,
            crossDepartmentImpact: insights.leadership.crossDepartmentImpact,
            recommendedActions: insights.leadership.recommendedActions,
            lastAnalyzedAt: new Date()
          });
        }
      }

      res.json(insights);
    } catch (error) {
      console.error('Error generating behavioral analysis:', error);
      res.status(500).json({ message: 'Failed to generate behavioral analysis' });
    }
  });

  // Get rising star candidates for tenant (premium feature)
  app.get('/api/ai/rising-stars', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      
      if (!hasAIAccess(currentUser)) {
        return res.status(403).json({ 
          message: "AI features are available for Norming, Performing, and AppSumo subscription tiers",
          upgradeRequired: true 
        });
      }

      if (!currentUser) {
        return res.status(401).json({ message: "User session not found" });
      }
      
      const employee = await storage.getEmployeeByUserId(currentUser.id);
      const tenantId = employee?.tenantId;
      if (!tenantId) {
        return res.status(400).json({ message: "No tenant found" });
      }

      const risingStars = await storage.getRisingStarCandidates(tenantId);
      
      // Get employee details for each rising star
      const risingStarsWithDetails = await Promise.all(
        risingStars.map(async (star) => {
          const employee = await storage.getEmployee(star.employeeId);
          if (!employee) return { ...star, employee: null };
          
          const user = await storage.getUser(employee.userId);
          const department = employee.departmentId ? await storage.getDepartment(employee.departmentId) : null;
          
          return {
            ...star,
            employee: {
              firstName: user?.firstName || 'Unknown',
              lastName: user?.lastName || '',
              jobTitle: user?.firstName || 'No Title', // Using firstName as placeholder since jobTitle doesn't exist in schema
              department: department?.name || 'No Department'
            }
          };
        })
      );

      res.json(risingStarsWithDetails);
    } catch (error) {
      console.error('Error fetching rising stars:', error);
      res.status(500).json({ message: 'Failed to fetch rising star candidates' });
    }
  });

  // Get behavioral analysis history for employee (premium feature)
  app.get('/api/ai/employee/:employeeId/analysis', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const currentUser = await storage.getUser(user.claims.sub);
      
      if (!hasAIAccess(currentUser)) {
        return res.status(403).json({ 
          message: "AI features are available for Norming, Performing, and AppSumo subscription tiers",
          upgradeRequired: true 
        });
      }

      const { employeeId } = req.params;
      const { analysisType } = req.query;
      
      const analyses = await storage.getBehavioralAnalysis(employeeId, analysisType as string);
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching behavioral analysis:', error);
      res.status(500).json({ message: 'Failed to fetch behavioral analysis' });
    }
  });

  return httpServer;
}
