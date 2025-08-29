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

  const httpServer = createServer(app);
  return httpServer;
}
