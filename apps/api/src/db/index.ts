import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL || (
  process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('FATAL: DATABASE_URL must be set in production'); })()
    : 'postgresql://localhost:5432/portfolio_intel'
);

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
