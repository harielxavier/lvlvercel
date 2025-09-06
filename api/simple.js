// Simple JavaScript handler to test basic functionality
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Simple JS endpoint working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
