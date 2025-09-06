import express from "express";
import { registerRoutes } from "../server/routes.js";

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// Initialize routes once
let routesInitialized = false;
let initPromise = null;

async function initializeApp() {
  if (!routesInitialized && !initPromise) {
    initPromise = registerRoutes(app).then(() => {
      routesInitialized = true;
      return true;
    }).catch(err => {
      console.error("Failed to initialize routes:", err);
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error("Error:", {
    message,
    status,
    path: req.path,
    method: req.method,
    stack: err.stack
  });

  res.status(status).json({ 
    error: err.code || 'INTERNAL_ERROR',
    message,
    timestamp: new Date().toISOString()
  });
});

// Vercel serverless handler
export default async function handler(req, res) {
  try {
    // Initialize routes if needed
    await initializeApp();
    
    // Let Express handle the request
    app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({
      error: "INITIALIZATION_ERROR",
      message: "Failed to initialize application",
      timestamp: new Date().toISOString()
    });
  }
}