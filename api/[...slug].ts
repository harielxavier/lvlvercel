// Feature flag for bypassing authentication during testing
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true' || process.env.NODE_ENV === 'development';

// Mock user data for testing
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@lvlup.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'platform_admin',
    tenantId: 1,
    profileImageUrl: null
  },
  {
    id: 2,
    email: 'manager@lvlup.com',
    firstName: 'Manager',
    lastName: 'Smith',
    role: 'manager',
    tenantId: 1,
    profileImageUrl: null
  },
  {
    id: 3,
    email: 'employee@lvlup.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'employee',
    tenantId: 1,
    profileImageUrl: null
  }
];

export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url || '/unknown';
  console.log(`API Request: ${req.method} ${path} (BYPASS_AUTH: ${BYPASS_AUTH})`);

  // Health check
  if (path.includes('/health')) {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      bypassAuth: BYPASS_AUTH
    });
  }

  // Auth status - return authenticated when bypassing
  if (path.includes('/auth/status')) {
    return res.status(200).json({
      isAuthenticated: BYPASS_AUTH,
      hasVercelOAuth: !!(process.env.VERCEL_CLIENT_ID && process.env.VERCEL_CLIENT_SECRET),
      isDevelopment: process.env.NODE_ENV === 'development',
      bypassAuth: BYPASS_AUTH
    });
  }

  // User endpoint - return mock user when bypassing auth
  if (path.includes('/auth/user') || path.includes('/api/user')) {
    if (BYPASS_AUTH) {
      // Return the first mock user (admin) as the authenticated user
      return res.status(200).json(MOCK_USERS[0]);
    }
    return res.status(200).json({ user: null });
  }

  // Users list endpoint for user selection
  if (path.includes('/api/users') && BYPASS_AUTH) {
    return res.status(200).json(MOCK_USERS);
  }

  // Employees endpoint
  if (path.includes('/api/employees')) {
    return res.status(200).json([]);
  }

  // Logout endpoint
  if (path.includes('/api/logout')) {
    // Clear any auth cookies (even though we're not using them in this simplified version)
    res.setHeader('Set-Cookie', 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    
    // For GET requests (from window.location.href), redirect to login
    if (req.method === 'GET') {
      res.writeHead(302, { Location: '/api/login' });
      return res.end();
    }
    
    // For other requests, return JSON success
    return res.status(200).json({ 
      success: true,
      message: 'Logged out successfully'
    });
  }

  // Login page endpoint - show user selection when bypassing auth
  if (path.includes('/api/login')) {
    if (BYPASS_AUTH) {
      // Return a simple user selection page
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>LVL UP Performance - User Selection (Testing Mode)</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                max-width: 600px;
                margin: 2rem auto;
                padding: 0 1rem;
                background: #f9fafb;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              .user-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 1rem;
                margin: 0.5rem 0;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              .user-card:hover {
                background-color: #f5f5f5;
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
              .manager { background-color: #2563eb; color: white; }
              .employee { background-color: #16a34a; color: white; }
              .warning {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 1rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 LVL UP Performance</h1>
              <div class="warning">
                <strong>⚠️ Testing Mode:</strong> Authentication is bypassed. Select any user to continue.
              </div>
              <h2>Select User:</h2>
              ${MOCK_USERS.map(user => `
                <div class="user-card" onclick="selectUser(${user.id})">
                  <strong>${user.firstName} ${user.lastName}</strong>
                  <span class="role-badge ${user.role.replace('_', '-')}">${user.role.replace('_', ' ').toUpperCase()}</span>
                  <br>
                  <small>${user.email}</small>
                </div>
              `).join('')}
            </div>
            <script>
              function selectUser(userId) {
                // Store selected user in localStorage for the frontend to use
                localStorage.setItem('selectedUserId', userId);
                // Redirect to home page
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    // Normal behavior when auth is not bypassed
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  // Default response
  return res.status(200).json({ 
    message: 'API endpoint',
    path,
    timestamp: new Date().toISOString()
  });
}
