// Completely standalone endpoint with no imports
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ 
    message: 'Standalone endpoint working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    nodeVersion: process.version
  });
};
