// Database connection and utilities
export {
  initializeDatabase,
  closeDatabase,
  isDatabaseConnected,
  getDefaultDbPath,
  type DatabaseConfig,
} from "./connection";

/** Audit timestamp column names */
export const AUDIT_TIMESTAMP_KEYS = [
  "createdAt",
  "updatedAt",
  "deletedAt",
] as const;
