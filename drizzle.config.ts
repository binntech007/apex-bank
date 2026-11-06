import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

dotenv.config({ path: '.env.local' });

// Enable WebSocket support for the Neon migration connection
neonConfig.webSocketConstructor = ws;

if (!process.env.MIGRATION_DATABASE_URL) {
  throw new Error('MIGRATION_DATABASE_URL is missing from .env.local');
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.MIGRATION_DATABASE_URL,
  },
});