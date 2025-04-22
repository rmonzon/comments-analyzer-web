import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is missing.");
  console.error("Please set up a database in your deployment and add the DATABASE_URL secret.");
  // Initialize with dummy pool/db that will throw clear errors when accessed
  export const pool = null;
  export const db = null;
} else {

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  export const db = drizzle(pool, { schema });
}