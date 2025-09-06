// Minimal serverless function with basic health check
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const path = req.url.split('?')[0];
  
  try {
    // Basic routing
    if (path === '/api/health' || path === '/api/test') {
      return res.status(200).json({
        status: 'ok',
        message: 'API is working',
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        environment: {
          hasDatabase: !!process.env.DATABASE_URL,
          hasSession: !!process.env.SESSION_SECRET
        }
      });
    }
    
    // TODO: Add more routes progressively
    
    // Default 404
    res.status(404).json({
      error: 'NOT_FOUND',
      message: `Route ${path} not found`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred',
      timestamp: new Date().toISOString()
    });
  }
}