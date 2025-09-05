import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Initialize database connection
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    // Create a dummy pool that will error when used
    pool = {} as Pool;
    db = {} as ReturnType<typeof drizzle>;
  } else {
    // Initialize the actual database connection
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
  }
} catch (error) {
  console.error("Failed to initialize database:", error);
  // Create dummy exports that will error when used
  pool = {} as Pool;
  db = {} as ReturnType<typeof drizzle>;
}

export { pool, db };