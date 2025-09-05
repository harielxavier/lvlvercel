// Simple serverless function for Vercel
module.exports = (req, res) => {
  // Log environment status
  console.log("Function invoked:", req.url);
  console.log("Has DATABASE_URL:", !!process.env.DATABASE_URL);
  console.log("Has SESSION_SECRET:", !!process.env.SESSION_SECRET);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  // Handle OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Health check endpoint
  if (req.url === "/api/health" || req.url === "/health") {
    return res.status(200).json({ 
      status: "ok",
      message: "API is running",
      environment: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasSession: !!process.env.SESSION_SECRET,
        nodeEnv: process.env.NODE_ENV || "production"
      },
      timestamp: new Date().toISOString()
    });
  }

  // Default response for other endpoints
  res.status(200).json({
    message: "API endpoint working",
    path: req.url,
    method: req.method,
    environment: process.env.NODE_ENV || "production"
  });
};