import { text } from "drizzle-orm/sqlite-core";

/**
 * Common column definitions for DRY schema definitions
 */

/**
 * UUID primary key column
 * Use with: id: idColumn
 */
export const idColumn = text("id").primaryKey();

/**
 * Name column (required string)
 * Use with: name: nameColumn
 */
export const nameColumn = text("name").notNull();

/**
 * Audit timestamp columns for tracking record lifecycle
 * Stored as ISO 8601 strings for SQLite compatibility
 *
 * Usage: ...auditColumns
 */
export const auditColumns = {
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"), // nullable for soft delete
};
