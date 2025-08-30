// Configuration module for centralized environment variable management
import { z } from 'zod';

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
  
  // Optional service configurations
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

// Configuration validation and parsing
function loadConfig() {
  try {
    const env = envSchema.parse(process.env);
    
    // Validate critical configurations
    if (env.NODE_ENV === 'production') {
      // In production, require all authentication settings
      if (!env.REPLIT_AUTH_ISSUER || !env.REPLIT_AUTH_CLIENT_ID || !env.REPLIT_AUTH_CALLBACK_URL) {
        throw new Error('Authentication configuration is required in production');
      }
      
      // Warn about missing optional services
      if (!env.SMTP_HOST) {
        console.warn('[CONFIG] SMTP not configured - email notifications disabled');
      }
      
      if (!env.TWILIO_ACCOUNT_SID) {
        console.warn('[CONFIG] Twilio not configured - SMS notifications disabled');
      }
    }
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[CONFIG] Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    
    console.error('[CONFIG] Configuration error:', error);
    process.exit(1);
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
  email: Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS),
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