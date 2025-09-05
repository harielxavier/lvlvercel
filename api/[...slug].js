import express from "express";
import { registerRoutes } from "../server/routes.js";
import { storage } from "../server/storage.js";

// Create Express app for serverless function
const app = express();

// Trust proxy for proper IP and protocol detection
app.set("trust proxy", 1);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Set storage in app locals for feature guard middleware
app.locals.storage = storage;

// Register all existing routes from the server
// This includes the real login page with database users
registerRoutes(app).catch(err => {
  console.error("Failed to register routes:", err);
});

// Export the handler for Vercel
export default app;