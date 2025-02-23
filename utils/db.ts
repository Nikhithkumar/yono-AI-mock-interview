import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL ?? 'postgresql://neondb_owner:npg_GBpkmdDW0Ft8@ep-wandering-night-a5hx5z8m-pooler.us-east-2.aws.neon.tech/Yono_AI_Mock_Interview?sslmode=require');

// Corrected drizzle call
export const db = drizzle(sql, { schema });
