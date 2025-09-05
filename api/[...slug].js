import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Load environment variables
dotenv.config();

// Create Express app for serverless function
const app = express();

// Trust proxy for proper IP and protocol detection
app.set("trust proxy", 1);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Session configuration for serverless - only if DATABASE_URL exists
if (process.env.DATABASE_URL && process.env.SESSION_SECRET) {
  try {
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true, // Auto-create sessions table if needed
      ttl: 7 * 24 * 60 * 60, // 7 days in seconds
      tableName: "sessions",
    });

    // Configure session middleware
    app.use(session({
      secret: process.env.SESSION_SECRET,
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
  } catch (err) {
    // Session setup failed, continue without sessions
  }
}

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

// Health check endpoint (always available)
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "API is running",
    environment: process.env.NODE_ENV || "unknown",
    hasDatabase: !!process.env.DATABASE_URL,
    hasSession: !!process.env.SESSION_SECRET,
    timestamp: new Date().toISOString()
  });
});

// Auth endpoints
app.get("/api/auth/user", (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      user: req.session.user,
      authenticated: true,
      sessionId: req.sessionID
    });
  } else {
    res.json({
      user: null,
      authenticated: false,
      message: "Not authenticated"
    });
  }
});

app.get("/api/auth/status", (req, res) => {
  res.json({
    isAuthenticated: !!(req.session && req.session.user),
    hasVercelOAuth: false,
    isDevelopment: process.env.NODE_ENV === 'development'
  });
});

// Logout endpoints
app.get("/api/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error during logout"
        });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: "Successfully logged out" });
    });
  } else {
    res.json({ success: true, message: "No active session" });
  }
});

app.post("/api/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error during logout"
        });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: "Successfully logged out" });
    });
  } else {
    res.json({ success: true, message: "No active session" });
  }
});

// Dashboard endpoints
app.get("/api/dashboard/metrics/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  res.json({
    metrics: {
      totalEmployees: 0,
      totalFeedback: 0,
      activeReviews: 0,
      completedGoals: 0,
      tenantId
    }
  });
});

app.get("/api/dashboard/activity/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  res.json({
    activities: [],
    tenantId
  });
});

// Employees endpoints
app.get("/api/employees/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  res.json({
    employees: [],
    total: 0,
    tenantId
  });
});

app.post("/api/employees", (req, res) => {
  res.json({
    success: true,
    message: "Employee creation endpoint (mock)",
    data: req.body
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
    tiers: [
      {
        id: "forming",
        name: "Forming",
        displayName: "Forming",
        price: { monthly: 29, yearly: 290 },
        maxEmployees: 25,
        features: ["Basic features"]
      },
      {
        id: "storming",
        name: "Storming",
        displayName: "Storming",
        price: { monthly: 59, yearly: 590 },
        maxEmployees: 50,
        features: ["Advanced features"]
      },
      {
        id: "norming",
        name: "Norming",
        displayName: "Norming",
        price: { monthly: 99, yearly: 990 },
        maxEmployees: 100,
        features: ["Professional features"]
      },
      {
        id: "performing",
        name: "Performing",
        displayName: "Performing",
        price: { monthly: 199, yearly: 1990 },
        maxEmployees: null,
        features: ["Enterprise features"]
      }
    ],
    total: 4
  });
});

app.get("/api/platform/system-settings", (req, res) => {
  res.json({
    settings: [],
    total: 0
  });
});

app.get("/api/platform/users", (req, res) => {
  res.json({
    users: [],
    total: 0
  });
});

// Feedback endpoints
app.get("/api/feedback/:employeeId", (req, res) => {
  const { employeeId } = req.params;
  res.json({
    feedback: [],
    total: 0,
    employeeId
  });
});

app.post("/api/feedback", (req, res) => {
  res.json({
    success: true,
    message: "Feedback submitted (mock)",
    data: req.body
  });
});

// Goals endpoints
app.get("/api/goals/:employeeId", (req, res) => {
  const { employeeId } = req.params;
  res.json({
    goals: [],
    total: 0,
    employeeId
  });
});

app.get("/api/employee/:employeeId/goals", (req, res) => {
  const { employeeId } = req.params;
  res.json({
    goals: [],
    total: 0,
    employeeId
  });
});

// Performance reviews endpoints
app.get("/api/performance-reviews/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  res.json({
    reviews: [],
    total: 0,
    tenantId
  });
});

app.post("/api/performance-reviews", (req, res) => {
  res.json({
    success: true,
    message: "Performance review created (mock)",
    data: req.body
  });
});

// Departments endpoints
app.get("/api/departments/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  res.json({
    departments: [],
    total: 0,
    tenantId
  });
});

app.post("/api/departments", (req, res) => {
  res.json({
    success: true,
    message: "Department created (mock)",
    data: req.body
  });
});

// Job positions endpoints
app.get("/api/job-positions/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  res.json({
    positions: [],
    total: 0,
    tenantId
  });
});

app.post("/api/job-positions", (req, res) => {
  res.json({
    success: true,
    message: "Job position created (mock)",
    data: req.body
  });
});

// Special endpoints
app.get("/api/subscription/tier-info", (req, res) => {
  res.json({
    tier: "forming",
    displayName: "Forming",
    features: {
      basicEmployeeManagement: true,
      basicDashboard: true,
      employeeProfiles: true,
      maxEmployees: 25,
      bulkEmployeeOperations: false,
      advancedEmployeeSearch: false,
      departmentManagement: false,
      jobPositionManagement: false,
      employeeHierarchy: false,
      performanceReviews: true,
      advancedPerformanceMetrics: false,
      customPerformanceCriteria: false,
      basicFeedback: true,
      qrCodeFeedback: false,
      advancedFeedbackAnalytics: false,
      realTimeFeedbackAlerts: false,
      goalTracking: true,
      advancedGoalAnalytics: false,
      personalDevelopmentPlans: false,
      basicReporting: true,
      advancedAnalytics: false,
      customReports: false,
      dataExport: false,
      teamCollaboration: false,
      crossDepartmentVisibility: false,
      apiAccess: false,
      webhooks: false,
      ssoIntegration: false,
      supportLevel: "email"
    },
    pricing: {
      monthly: 29,
      yearly: 290
    }
  });
});

app.get("/api/user/employee", (req, res) => {
  res.json({
    employee: null,
    message: "No employee record found"
  });
});

app.get("/api/user/performance", (req, res) => {
  res.json({
    performance: null,
    message: "No performance data available"
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
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(500).json({ 
    error: "Internal server error",
    message: isDevelopment ? err.message : "An error occurred",
    stack: isDevelopment ? err.stack : undefined
  });
});

// Export the handler for Vercel
export default app;