import path from "node:path";
import fs from "node:fs";
import BetterSqlite3 from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { app } from "electron";
import * as schema from "./schema";

const DB_NAME = "pbuilder.db";

let db: BetterSQLite3Database<typeof schema> | null = null;
let sqlite: BetterSqlite3.Database | null = null;

/**
 * Configuration options for database initialization
 */
export interface DatabaseConfig {
  /** Custom database file path (for testing) */
  dbPath?: string;
  /** Custom migrations folder path (for testing) */
  migrationsPath?: string;
}

/**
 * Get the default database file path
 * Uses Electron's userData in production, or a local .data folder in development
 */
export function getDefaultDbPath(): string {
  const isDev = !app.isPackaged;

  if (isDev) {
    // In development, use a local .data folder
    const devDataPath = path.join(process.cwd(), ".data");
    if (!fs.existsSync(devDataPath)) {
      fs.mkdirSync(devDataPath, { recursive: true });
    }
    return path.join(devDataPath, DB_NAME);
  }

  // In production, use Electron's userData directory
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, DB_NAME);
}

/**
 * Get the default migrations folder path
 * In production, migrations are bundled with the app
 */
export function getDefaultMigrationsPath(): string {
  const isDev = !app.isPackaged;

  if (isDev) {
    return path.join(process.cwd(), "src/main/db/migrations");
  }

  // In production, migrations are in the resources folder
  return path.join(process.resourcesPath, "migrations");
}

/**
 * Initialize the database connection and run migrations
 * @param config - Optional configuration for custom paths (useful for testing)
 */
export async function initializeDatabase(
  config?: DatabaseConfig
): Promise<BetterSQLite3Database<typeof schema>> {
  if (db) {
    return db;
  }

  const dbPath = config?.dbPath ?? getDefaultDbPath();
  const migrationsPath = config?.migrationsPath ?? getDefaultMigrationsPath();

  console.log(`[DB] Initializing database at: ${dbPath}`);
  console.log(`[DB] Migrations path: ${migrationsPath}`);

  // Ensure the directory exists for the database file
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create the SQLite connection
  const sqliteDb = new BetterSqlite3(dbPath);

  // Enable WAL mode for better concurrent read performance
  sqliteDb.pragma("journal_mode = WAL");

  // Store reference for cleanup
  sqlite = sqliteDb;

  // Create Drizzle instance with schema
  db = drizzle(sqliteDb, { schema });

  // Run migrations
  console.log("[DB] Running migrations...");
  migrate(db, { migrationsFolder: migrationsPath });
  console.log("[DB] Migrations complete");

  return db;
}

/**
 * Get the database instance
 * Throws if database has not been initialized
 */
export function getDatabase(): BetterSQLite3Database<typeof schema> {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first."
    );
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (sqlite) {
    console.log("[DB] Closing database connection");
    sqlite.close();
    sqlite = null;
    db = null;
  }
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  return db !== null && sqlite !== null;
}
