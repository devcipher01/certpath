// Server-only DB client — Drizzle ORM over Postgres.
//
// Connection priority:
//   1. SUPABASE_DB_URL  — set this in Vercel to your Supabase connection string
//      (Dashboard → Project Settings → Database → Connection string → URI,
//       Transaction pooler port 6543). This is the production database.
//   2. DATABASE_URL     — Replit's managed Postgres, used automatically in the
//      dev environment so the app works locally without extra config.
//
// Never import this from client code — the importProtection guard on this
// folder blocks any client bundle from pulling it in.
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __certpathPool: Pool | undefined;
}

function getPool(): Pool {
  if (!globalThis.__certpathPool) {
    const connectionString = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "No database connection string found. Set SUPABASE_DB_URL (production) or DATABASE_URL (dev).",
      );
    }
    globalThis.__certpathPool = new Pool({
      connectionString,
      ssl: connectionString.includes("supabase") ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalThis.__certpathPool;
}

export const db = drizzle(getPool(), { schema });
