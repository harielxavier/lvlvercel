// Serverless function that integrates with Express server
import express from 'express';
import { registerRoutes } from '../server/routes.js';
import { setupAuth } from '../server/auth.js';
import { db } from '../server/db.js';

// Create Express app instance
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Initialize auth and routes
let initialized = false;
async function initialize() {
  if (!initialized) {
    try {
      // Setup authentication
      setupAuth(app);
      
      // Register all routes
      registerRoutes(app);
      
      initialized = true;
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }
}

// Serverless handler
export default async function handler(req, res) {
  // Initialize on first request
  await initialize();
  
  // Let Express handle the request
  app(req, res);
}