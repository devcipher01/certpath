// Server-only DB client — Supabase Postgres via Drizzle ORM.
// Set DATABASE_URL in Vercel to your Supabase connection string:
//   Project Settings → Database → Connection string (URI) → Transaction pooler
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
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Add your Supabase connection string to Vercel → Settings → Environment Variables.",
      );
    }
    // Supabase pooler (port 6543) requires ssl; direct connection (5432) does too.
    globalThis.__certpathPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return globalThis.__certpathPool;
}

export const db = drizzle(getPool(), { schema });
