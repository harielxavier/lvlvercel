import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage.js";

// Vercel OAuth configuration
const VERCEL_OAUTH_CONFIG = {
  authorizationURL: 'https://vercel.com/oauth/authorize',
  tokenURL: 'https://vercel.com/oauth/access_token',
  clientID: process.env.VERCEL_CLIENT_ID || '',
  clientSecret: process.env.VERCEL_CLIENT_SECRET || '',
  callbackURL: process.env.VERCEL_CALLBACK_URL || 'http://localhost:5000/api/auth/vercel/callback'
};

// Development mode flag
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

// Vercel OAuth Strategy
function createVercelStrategy() {
  return new OAuth2Strategy(
    {
      authorizationURL: VERCEL_OAUTH_CONFIG.authorizationURL,
      tokenURL: VERCEL_OAUTH_CONFIG.tokenURL,
      clientID: VERCEL_OAUTH_CONFIG.clientID,
      clientSecret: VERCEL_OAUTH_CONFIG.clientSecret,
      callbackURL: VERCEL_OAUTH_CONFIG.callbackURL,
      scope: ['user:email', 'team:read', 'project:read']
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Fetch user data from Vercel API
        const userResponse = await fetch('https://api.vercel.com/v2/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!userResponse.ok) {
          return done(new Error('Failed to fetch user data from Vercel'));
        }
        
        const vercelUser = await userResponse.json();
        
        // Create or update user in our database
        let user = await storage.getUserByEmail(vercelUser.email);
        
        if (!user) {
          // Create new user with platform_admin role for now
          // You might want to modify this based on your business logic
          user = await storage.createUser({
            email: vercelUser.email,
            firstName: vercelUser.name?.split(' ')[0] || 'Unknown',
            lastName: vercelUser.name?.split(' ').slice(1).join(' ') || 'User',
            role: 'platform_admin', // Default role, you can customize this
            profileImageUrl: vercelUser.avatar || null
          });
        }
        
        // Create user session with Vercel tokens
        const userSession = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            profile_image_url: user.profileImageUrl || null,
            vercel_user_id: vercelUser.uid,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          vercel_access_token: accessToken,
          expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        };
        
        return done(null, userSession);
      } catch (error) {
        console.error('Vercel OAuth error:', error);
        return done(error);
      }
    }
  );
}

// Development user session setup (fallback)
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

  // Configure Vercel OAuth if credentials are available
  const hasVercelCredentials = VERCEL_OAUTH_CONFIG.clientID && VERCEL_OAUTH_CONFIG.clientSecret;
  
  if (hasVercelCredentials) {
    passport.use('vercel', createVercelStrategy());
    
    // Vercel OAuth routes
    app.get('/api/auth/vercel', passport.authenticate('vercel'));
    
    app.get('/api/auth/vercel/callback',
      passport.authenticate('vercel', { failureRedirect: '/login?error=auth_failed' }),
      (req, res) => {
        // Successful authentication
        res.redirect('/');
      }
    );
  } else {
    console.warn("⚠️  Vercel OAuth credentials not configured, falling back to development mode");
  }

  // Development authentication routes (fallback when Vercel OAuth is not configured)
  if (isDevelopment || !hasVercelCredentials) {
    // Login page with user selection
    app.get("/api/login", async (req, res) => {
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
              .oauth-button {
                display: inline-block;
                background: #000;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
                margin: 1rem 0;
                transition: background-color 0.2s;
              }
              .oauth-button:hover {
                background: #333;
              }
              .divider {
                margin: 2rem 0;
                text-align: center;
                color: #6b7280;
                position: relative;
              }
              .divider::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 1px;
                background: #e5e7eb;
                z-index: 1;
              }
              .divider span {
                background: white;
                padding: 0 1rem;
                position: relative;
                z-index: 2;
              }
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
              
              ${hasVercelCredentials ? `
                <h2>Sign in with Vercel</h2>
                <p>Connect your Vercel account to access the platform:</p>
                <a href="/api/auth/vercel" class="oauth-button">
                  Sign in with Vercel
                </a>
                
                <div class="divider">
                  <span>or for development</span>
                </div>
              ` : `
                <div class="mode-indicator">
                  Development Mode: Vercel OAuth not configured
                </div>
              `}
              
              <h3>Development Login</h3>
              <p>Select a user to login as${isDevelopment ? ' (Development Mode Only)' : ''}:</p>
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
                  console.error('Login error:', error);
                  alert('Login failed. Please try again.');
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
        
        // Validate userId format
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
  }

  // Logout route
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect("/api/login");
    });
  });

  // Auth status endpoint
  app.get("/api/auth/status", (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated(),
      hasVercelOAuth: hasVercelCredentials,
      isDevelopment
    });
  });
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

  // Try to refresh token if it's a Vercel OAuth session
  if (user.refresh_token && user.vercel_access_token) {
    try {
      // TODO: Implement token refresh with Vercel OAuth
      // For now, just extend the session in development
      if (isDevelopment) {
        user.expires_at = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
        return next();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }

  // In development, just extend the session
  if (isDevelopment) {
    user.expires_at = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    return next();
  }

  res.status(401).json({ message: "Unauthorized" });
};

// Helper function to get Vercel access token from user session
export function getVercelAccessToken(req: any): string | null {
  const user = req.user as any;
  return user?.vercel_access_token || null;
}

// Helper function to make authenticated requests to Vercel API
export async function makeVercelAPIRequest(req: any, endpoint: string, options: RequestInit = {}) {
  const accessToken = getVercelAccessToken(req);
  
  if (!accessToken) {
    throw new Error('No Vercel access token available');
  }
  
  const response = await fetch(`https://api.vercel.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`Vercel API request failed: ${response.statusText}`);
  }
  
  return response.json();
}
