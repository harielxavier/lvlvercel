// Ultra-simple serverless function for debugging
module.exports = (req, res) => {
  // Basic response - no dependencies, no environment checks
  res.status(200).json({
    message: "API is working",
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};