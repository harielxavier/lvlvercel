import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

neonConfig.webSocketConstructor = ws;

// Lazy initialization to avoid throwing errors during module load
let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  _db = drizzle({ client: _pool, schema });
}

// Export getters that initialize on first use
export const pool = new Proxy({} as Pool, {
  get(target, prop) {
    if (!_pool) {
      initializeDatabase();
    }
    return (_pool as any)[prop];
  }
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!_db) {
      initializeDatabase();
    }
    return (_db as any)[prop];
  }
});