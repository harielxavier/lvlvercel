import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { config } from "../server/config";

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

// Register API routes
registerRoutes(app);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("API Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Export the handler for Vercel
export default app;
