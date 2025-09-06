import type { VercelRequest, VercelResponse } from '@vercel/node';

// Minimal handler for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
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

  // Default response
  return res.status(503).json({ 
    message: 'API under maintenance - Vercel auth integration in progress',
    path,
    timestamp: new Date().toISOString()
  });
}
