// Configuration module for centralized environment variable management
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Schema for environment configuration validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('5000'),
  
  // Database configuration
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  
  // Session configuration
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  
  // Authentication configuration
  REPLIT_AUTH_ISSUER: z.string().url().optional(),
  REPLIT_AUTH_CLIENT_ID: z.string().optional(),
  REPLIT_AUTH_CALLBACK_URL: z.string().url().optional(),
  
  // Email service configuration (Mailgun)
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),
  
  // SMS service configuration (optional - not used)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

// Type for the configuration
type Config = z.infer<typeof envSchema>;

// Configuration validation and parsing
function loadConfig(): Config {
  try {
    const env = envSchema.parse(process.env);
    
    // Log warnings for missing optional services in production
    if (env.NODE_ENV === 'production') {
      if (!env.REPLIT_AUTH_ISSUER || !env.REPLIT_AUTH_CLIENT_ID || !env.REPLIT_AUTH_CALLBACK_URL) {
        console.warn('Authentication configuration is missing in production');
      }
      
      if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN) {
        console.warn('Email service (Mailgun) is not configured');
      }
      
      if (!env.TWILIO_ACCOUNT_SID) {
        console.warn('SMS service (Twilio) is not configured');
      }
    }
    
    return env;
  } catch (error) {
    console.error('Configuration validation failed');
    
    if (error instanceof z.ZodError) {
      console.error('Configuration errors:');
      error.errors.forEach(err => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    // Return a minimal valid config to prevent crashes
    // This allows the server to start and show proper error messages
    return {
      NODE_ENV: (process.env.NODE_ENV as any) || 'production',
      PORT: parseInt(process.env.PORT || '5000'),
      DATABASE_URL: process.env.DATABASE_URL || '',
      SESSION_SECRET: process.env.SESSION_SECRET || 'temporary-secret-please-configure-properly',
      REPLIT_AUTH_ISSUER: process.env.REPLIT_AUTH_ISSUER,
      REPLIT_AUTH_CLIENT_ID: process.env.REPLIT_AUTH_CLIENT_ID,
      REPLIT_AUTH_CALLBACK_URL: process.env.REPLIT_AUTH_CALLBACK_URL,
      MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
      MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    };
  }
}

// Export validated configuration
export const config = loadConfig();

// Configuration utilities
export const isProduction = () => config.NODE_ENV === 'production';
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isTest = () => config.NODE_ENV === 'test';

// Service availability checks
export const services = {
  email: Boolean(config.MAILGUN_API_KEY && config.MAILGUN_DOMAIN),
  sms: Boolean(config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN && config.TWILIO_PHONE_NUMBER),
  auth: Boolean(config.REPLIT_AUTH_ISSUER && config.REPLIT_AUTH_CLIENT_ID),
};

// Database configuration
export const dbConfig = {
  url: config.DATABASE_URL,
  ssl: isProduction() ? { rejectUnauthorized: false } : false,
  maxConnections: isProduction() ? 20 : 5,
};

// Session configuration
export const sessionConfig = {
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction(), // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' as const, // CSRF protection
  },
};

export default config;