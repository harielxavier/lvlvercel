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

  console.log(`API Request: ${req.method} ${path}`);

  // Health check
  if (path.includes('/health')) {
    return res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }

  // Auth status
  if (path.includes('/auth/status')) {
    return res.status(200).json({
      isAuthenticated: false,
      hasVercelOAuth: !!(process.env.VERCEL_CLIENT_ID && process.env.VERCEL_CLIENT_SECRET),
      isDevelopment: process.env.NODE_ENV === 'development'
    });
  }

  // User endpoint
  if (path.includes('/api/user')) {
    return res.status(200).json({ user: null });
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

  // Login page endpoint (simple redirect to home for now)
  if (path.includes('/api/login')) {
    // For now, just redirect to home page since we don't have auth
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
