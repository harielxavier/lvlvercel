import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "../server/storage.js";

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

// Login page with user selection - shows REAL users from the database
app.get("/api/login", async (req, res) => {
  try {
    // Get real users from the database
    const users = await storage.getAllUsers();
    
    const loginHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LVL UP Performance - Login</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              max-width: 800px; 
              margin: 2rem auto; 
              padding: 0 1rem; 
              background: #f9fafb;
            }
            .login-container {
              background: white;
              border-radius: 12px;
              padding: 2rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            h1 { color: #111827; margin-bottom: 2rem; }
            .user-card { 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
              padding: 1rem; 
              margin: 0.5rem 0; 
              cursor: pointer;
              transition: all 0.2s;
            }
            .user-card:hover { 
              background-color: #f3f4f6; 
              border-color: #d1d5db;
            }
            .role-badge { 
              display: inline-block; 
              padding: 0.25rem 0.5rem; 
              border-radius: 4px; 
              font-size: 0.75rem; 
              font-weight: bold; 
              margin-left: 0.5rem; 
            }
            .platform-admin { background-color: #dc2626; color: white; }
            .tenant-admin { background-color: #2563eb; color: white; }
            .manager { background-color: #16a34a; color: white; }
            .employee { background-color: #9333ea; color: white; }
            .tenant-info { color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem; }
            .mode-indicator {
              background: #fbbf24;
              color: #92400e;
              padding: 0.5rem 1rem;
              border-radius: 6px;
              font-size: 0.875rem;
              margin-bottom: 1.5rem;
            }
          </style>
        </head>
        <body>
          <div class="login-container">
            <h1>🚀 LVL UP Performance</h1>
            <div class="mode-indicator">
              Development Mode - Select a user to login
            </div>
            <h3>Available Users</h3>
            <p>Select a user to login as (from database):</p>
            ${users.map(user => `
              <div class="user-card" onclick="loginAs('${user.id}')">
                <div><strong>${user.firstName} ${user.lastName}</strong> <span class="role-badge ${user.role || 'employee'}">${(user.role || 'employee').replace('_', ' ').toUpperCase()}</span></div>
                <div class="tenant-info">${user.email}</div>
                <div class="tenant-info">Tenant: ${user.tenantId || 'No tenant'}</div>
              </div>
            `).join('')}
          </div>
          
          <script>
            function loginAs(userId) {
              fetch('/api/dev-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
              }).then(response => {
                if (response.ok) {
                  window.location.href = '/';
                } else {
                  alert('Login failed. Please try again.');
                }
              }).catch(error => {
                alert('Login failed. Please try again.');
              });
            }
          </script>
        </body>
      </html>
    `;
    res.send(loginHtml);
  } catch (error) {
    // If database connection fails, show error page
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LVL UP Performance - Login Error</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              max-width: 800px; 
              margin: 2rem auto; 
              padding: 0 1rem; 
              background: #f9fafb;
            }
            .error-container {
              background: white;
              border-radius: 12px;
              padding: 2rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            h1 { color: #dc2626; }
            .error-box {
              background: #fee2e2;
              border: 1px solid #dc2626;
              border-radius: 8px;
              padding: 1rem;
              margin: 1rem 0;
              color: #991b1b;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>⚠️ Login Unavailable</h1>
            <div class="error-box">
              <strong>Database Connection Error</strong><br>
              Unable to connect to the database to retrieve user accounts.
              Please ensure the database is properly configured.
            </div>
            <p>Error: ${error.message || 'Unknown error'}</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Development login handler
app.post("/api/dev-login", async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate userId format
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    
    const user = await storage.getUser(userId);
    if (user) {
      // Store user in session
      if (req.session) {
        req.session.user = user;
        req.session.save((err) => {
          if (err) {
            return res.status(500).json({ error: "Login failed" });
          }
          res.json({ success: true, user });
        });
      } else {
        // If no session support, still return success for dev mode
        res.json({ success: true, user });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
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
      // Redirect to the actual app login page
      res.redirect('https://lvlvercel.vercel.app/login');
    });
  } else {
    // Redirect to login page even if no session
    res.redirect('https://lvlvercel.vercel.app/login');
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
      // For POST requests, return JSON (for API calls)
      res.json({ success: true, message: "Successfully logged out", redirect: "/login" });
    });
  } else {
    res.json({ success: true, message: "No active session", redirect: "/login" });
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