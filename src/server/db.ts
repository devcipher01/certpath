// Server-only DB client. Never import this from client code — see the note
// in schema.ts about the importProtection guard on this folder.
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
      throw new Error("DATABASE_URL is not set — the database connection cannot be established.");
    }
    globalThis.__certpathPool = new Pool({ connectionString });
  }
  return globalThis.__certpathPool;
}

export const db = drizzle(getPool(), { schema });
