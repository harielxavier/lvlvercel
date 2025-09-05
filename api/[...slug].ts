import express, { type Request, Response, NextFunction } from "express";

// Check for required environment variables early
if (!process.env.DATABASE_URL) {
  console.error("CRITICAL: DATABASE_URL is not set in environment variables");
}

if (!process.env.SESSION_SECRET) {
  console.error("CRITICAL: SESSION_SECRET is not set in environment variables");
}

// Create Express app for serverless function
const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok",
    environment: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasSession: !!process.env.SESSION_SECRET,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Initialize routes with error handling
try {
  // Import and register routes synchronously
  const { registerRoutes } = require("../server/routes");
  registerRoutes(app);
} catch (error) {
  console.error("Failed to initialize routes:", error);
  
  // Fallback error handler for all routes
  app.use((req: Request, res: Response) => {
    console.error("Route initialization failed, path:", req.path);
    console.error("Error details:", error);
    
    res.status(500).json({ 
      error: "Server initialization failed",
      details: error instanceof Error ? error.message : "Unknown error",
      path: req.path,
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasSession: !!process.env.SESSION_SECRET
      }
    });
  });
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("API Error:", err);
  console.error("Stack:", err.stack);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message || "Unknown error occurred"
  });
});

// Export the handler for Vercel
export default app;