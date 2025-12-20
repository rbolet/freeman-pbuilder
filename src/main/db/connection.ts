import path from "node:path";
import fs from "node:fs";
import { Sequelize } from "sequelize";
import { app } from "electron";
import { runMigrations } from "./migrations";

const DB_NAME = "pbuilder.db";

// Registry to track database connections by path
const dbRegistry = new Map<string, Sequelize>();

/**
 * Configuration options for database initialization
 */
export interface DatabaseConfig {
  /** Custom database file path (for testing) */
  dbPath?: string;
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
 * Initialize the database connection and run migrations
 * @param config - Optional configuration for custom paths (useful for testing)
 * @returns Sequelize instance for the database
 */
export async function initializeDatabase(
  config?: DatabaseConfig
): Promise<Sequelize> {
  const dbPath = config?.dbPath ?? getDefaultDbPath();

  // Check if we already have a connection for this path
  const existingDb = dbRegistry.get(dbPath);
  if (existingDb) {
    return existingDb;
  }

  console.log(`[DB] Initializing database at: ${dbPath}`);

  // Ensure the directory exists for the database file
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create Sequelize instance with better-sqlite3
  // Don't specify dialectModule - let Sequelize find better-sqlite3 automatically
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: false,
  });

  // Enable WAL mode for better concurrent read performance
  await sequelize.query("PRAGMA journal_mode = WAL;");

  // Run migrations
  await runMigrations(sequelize);

  // Store in registry
  dbRegistry.set(dbPath, sequelize);

  return sequelize;
}

/**
 * Close a database connection
 * @param sequelize - The Sequelize instance to close
 */
export async function closeDatabase(sequelize: Sequelize): Promise<void> {
  console.log("[DB] Closing database connection");
  await sequelize.close();

  // Remove from registry
  for (const [path, instance] of dbRegistry.entries()) {
    if (instance === sequelize) {
      dbRegistry.delete(path);
      break;
    }
  }
}

/**
 * Check if a database instance is connected
 * @param sequelize - The Sequelize instance to check
 */
export function isDatabaseConnected(sequelize: Sequelize): boolean {
  try {
    // Sequelize doesn't have a simple isConnected check
    // We rely on the registry and trust that if it's in there, it's connected
    for (const instance of dbRegistry.values()) {
      if (instance === sequelize) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
