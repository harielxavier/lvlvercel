import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage.js";

// Development authentication - simplified for testing multi-tenant functionality
const isDevelopment = process.env.NODE_ENV === "development";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Ensure session secret is properly configured
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    if (isDevelopment) {
      console.warn("⚠️  WARNING: SESSION_SECRET not set, using development fallback");
    } else {
      throw new Error("SESSION_SECRET environment variable is required in production");
    }
  }
  
  return session({
    secret: sessionSecret || "dev-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !isDevelopment, // Secure cookies in production, allow HTTP in development
      maxAge: sessionTtl,
      sameSite: 'strict', // CSRF protection
    },
  });
}

// Development user session setup
function createDevUserSession(userData: any) {
  return {
    claims: {
      sub: userData.id,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      profile_image_url: userData.profileImageUrl || null,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    },
    access_token: 'dev-token',
    refresh_token: 'dev-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
  };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Development authentication routes
  if (isDevelopment) {
    // Login page with user selection
    app.get("/api/login", async (req, res) => {
      const users = await storage.getAllUsers();
      const loginHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>LVL UP Performance - Development Login</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
              .user-card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin: 0.5rem 0; cursor: pointer; }
              .user-card:hover { background-color: #f5f5f5; }
              .role-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; margin-left: 0.5rem; }
              .platform-admin { background-color: #dc2626; color: white; }
              .tenant-admin { background-color: #2563eb; color: white; }
              .manager { background-color: #16a34a; color: white; }
              .employee { background-color: #9333ea; color: white; }
              .tenant-info { color: #666; font-size: 0.875rem; }
            </style>
          </head>
          <body>
            <h1>🚀 LVL UP Performance - Development Login</h1>
            <p>Select a user to login as (Development Mode Only):</p>
            ${users.map(user => `
              <div class="user-card" onclick="loginAs('${user.id}')">
                <div><strong>${user.firstName} ${user.lastName}</strong> <span class="role-badge ${user.role || 'employee'}">${(user.role || 'employee').replace('_', ' ').toUpperCase()}</span></div>
                <div class="tenant-info">${user.email}</div>
                <div class="tenant-info">Tenant: ${user.tenantId}</div>
              </div>
            `).join('')}
            <script>
              function loginAs(userId) {
                fetch('/api/dev-login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId })
                }).then(() => {
                  window.location.href = '/';
                });
              }
            </script>
          </body>
        </html>
      `;
      res.send(loginHtml);
    });

    // Development login handler
    app.post("/api/dev-login", async (req, res) => {
      try {
        const { userId } = req.body;
        
        // Validate userId format (allow UUIDs and development test IDs)
        if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
          return res.status(400).json({ error: "Invalid user ID format" });
        }
        
        const user = await storage.getUser(userId);
        if (user) {
          const userSession = createDevUserSession(user);
          req.logIn(userSession, (err) => {
            if (err) {
              console.error('Login error:', err);
              return res.status(500).json({ error: "Login failed" });
            }
            res.json({ success: true, user: userSession.claims });
          });
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (error) {
        console.error('Development login error:', error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Logout
    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/api/login");
      });
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;
  if (!user || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  // In development, just extend the session
  if (isDevelopment) {
    user.expires_at = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    return next();
  }

  res.status(401).json({ message: "Unauthorized" });
};
