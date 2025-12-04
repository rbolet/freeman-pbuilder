// Database connection and utilities
export {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  isDatabaseConnected,
  getDefaultDbPath,
  getDefaultMigrationsPath,
  type DatabaseConfig,
} from "./connection";

// Schema exports
export * from "./schema";
