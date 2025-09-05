import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Load environment variables
dotenv.config();

// Create Express app for serverless function
const app = express();

// Session configuration for serverless
const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  ttl: 7 * 24 * 60 * 60, // 7 days in seconds
  tableName: "sessions",
});

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  }
}));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "API is running",
    environment: process.env.NODE_ENV || "unknown",
    hasDatabase: !!process.env.DATABASE_URL,
    hasSession: !!process.env.SESSION_SECRET
  });
});

// Auth endpoints
app.get("/api/auth/user", (req, res) => {
  // Check if user is authenticated via session
  if (req.session && req.session.user) {
    return res.json({
      user: req.session.user,
      authenticated: true,
      sessionId: req.sessionID
    });
  }
  
  // Return null user if not authenticated
  res.json({
    user: null,
    authenticated: false,
    message: "Not authenticated"
  });
});

// Logout endpoint with proper session handling
app.get("/api/logout", (req, res) => {
  // Check if user is authenticated
  if (!req.session) {
    return res.status(200).json({ 
      success: true, 
      message: "No active session to logout" 
    });
  }

  const sessionId = req.sessionID;
  const userId = req.session.userId || req.session.user?.id;

  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ 
        success: false, 
        message: "Error during logout",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Clear the session cookie
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    // Log successful logout
    console.log(`User ${userId} logged out successfully. Session ${sessionId} destroyed.`);

    // Return success response
    res.status(200).json({ 
      success: true, 
      message: "Successfully logged out" 
    });
  });
});

// Alternative POST logout endpoint for better REST compliance
app.post("/api/logout", (req, res) => {
  // Check if user is authenticated
  if (!req.session) {
    return res.status(200).json({ 
      success: true, 
      message: "No active session to logout" 
    });
  }

  const sessionId = req.sessionID;
  const userId = req.session.userId || req.session.user?.id;

  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ 
        success: false, 
        message: "Error during logout",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Clear the session cookie
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    // Log successful logout
    console.log(`User ${userId} logged out successfully. Session ${sessionId} destroyed.`);

    // Return success response
    res.status(200).json({ 
      success: true, 
      message: "Successfully logged out" 
    });
  });
});

// Dashboard endpoints
app.get("/api/dashboard/metrics/:tenantId", (req, res) => {
  res.json({
    metrics: {
      totalEmployees: 0,
      totalFeedback: 0,
      activeReviews: 0,
      completedGoals: 0
    }
  });
});

app.get("/api/dashboard/activity/:tenantId", (req, res) => {
  res.json({
    activities: []
  });
});

// Employees endpoint
app.get("/api/employees/:tenantId", (req, res) => {
  res.json({
    employees: [],
    total: 0
  });
});

// Platform endpoints
app.get("/api/platform/metrics", (req, res) => {
  res.json({
    totalTenants: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    revenue: 0
  });
});

app.get("/api/platform/tenants", (req, res) => {
  res.json({
    tenants: [],
    total: 0
  });
});

app.get("/api/platform/pricing-tiers", (req, res) => {
  res.json({
    tiers: [],
    total: 0
  });
});

// Catch all API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ 
    error: "Not found",
    path: req.path,
    method: req.method,
    message: "Endpoint not implemented yet"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("API Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Export the handler for Vercel
export default app;