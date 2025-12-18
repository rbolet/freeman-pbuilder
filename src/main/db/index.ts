// Database connection and utilities
export {
  initializeDatabase,
  closeDatabase,
  isDatabaseConnected,
  getDefaultDbPath,
  type DatabaseConfig,
} from "./connection";

<<<<<<< Updated upstream
// Schema exports
export * from "./schema";
=======
/** Audit timestamp column names */
export const AUDIT_TIMESTAMP_KEYS = ["createdAt", "updatedAt", "deletedAt"] as const;
>>>>>>> Stashed changes
