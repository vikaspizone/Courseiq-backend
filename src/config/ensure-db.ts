import { Client } from 'pg';
import { logErrorToFile } from '../utils/logger';

export async function ensureDatabaseExists() {
  // Bypass database check on production or when using a connection string
  if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
    console.log('[Database] Bypassing target database existence checks (handled by cloud provider/DB string).');
    return;
  }

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USERNAME || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const database = process.env.DB_NAME || 'courseiq';

  // Connect to the default 'postgres' database to check/create the target database
  const client = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
  });

  try {
    await client.connect();
    
    // Check if the target database exists
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [database],
    );

    if (res.rowCount === 0) {
      console.log(`[Database] Target database "${database}" does not exist. Creating...`);
      // Note: Database name is safe to interpolate here as it's loaded from verified configuration
      await client.query(`CREATE DATABASE "${database}"`);
      console.log(`[Database] Database "${database}" created successfully.`);
    } else {
      console.log(`[Database] Database "${database}" already exists.`);
    }
  } catch (error) {
    console.error('[Database] Failed to check or create database:', error);
    logErrorToFile({ error, context: 'DatabaseConnectionCheck' });
  } finally {
    try {
      await client.end();
    } catch (err) {
      // Ignore closing error
    }
  }
}
