import express, { type Request, Response, NextFunction } from "express";

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

// Lazy load routes to avoid initialization errors
let routesInitialized = false;
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!routesInitialized) {
    try {
      // Check for required environment variables
      if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not set in environment variables");
        return res.status(500).json({ 
          error: "Server configuration error", 
          details: "Database connection not configured"
        });
      }
      
      if (!process.env.SESSION_SECRET) {
        console.error("SESSION_SECRET is not set in environment variables");
        return res.status(500).json({ 
          error: "Server configuration error", 
          details: "Session configuration missing"
        });
      }

      // Dynamically import and initialize routes
      const { registerRoutes } = await import("../server/routes");
      registerRoutes(app);
      routesInitialized = true;
    } catch (error) {
      console.error("Failed to initialize routes:", error);
      return res.status(500).json({ 
        error: "Failed to initialize server", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  next();
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("API Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Export the handler for Vercel
export default app;
