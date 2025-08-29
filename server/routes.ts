import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEmployeeSchema, insertFeedbackSchema, insertTenantSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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
  app.get("/api/dashboard/metrics/:tenantId", isAuthenticated, async (req, res) => {
    try {
      const { tenantId } = req.params;
      const metrics = await storage.getDashboardMetrics(tenantId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
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

  // Employee management routes
  app.get("/api/employees/:tenantId", isAuthenticated, async (req, res) => {
    try {
      const { tenantId } = req.params;
      const employees = await storage.getEmployeesByTenant(tenantId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Feedback routes
  app.get("/api/feedback/:employeeId", isAuthenticated, async (req, res) => {
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
  app.get("/api/goals/:employeeId", isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const goals = await storage.getGoalsByEmployee(employeeId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Departments routes
  app.get("/api/departments/:tenantId", isAuthenticated, async (req, res) => {
    try {
      const { tenantId } = req.params;
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
      const employee = await storage.getEmployeeByFeedbackUrl(feedbackUrl);
      if (!employee) {
        return res.status(404).json({ message: "Feedback link not found" });
      }
      
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        employeeId: employee.id
      });
      const feedback = await storage.createFeedback(feedbackData);
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

  const httpServer = createServer(app);
  return httpServer;
}
