import { text } from "drizzle-orm/sqlite-core";

/**
 * Common column definitions for DRY schema definitions
 */

/**
 * UUID primary key column with auto-generated UUID default
 * Use with: id: idColumn
 */
export const id = text("id")
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID());

/**
 * Name column (required string)
 * Use with: name: nameColumn
 */
export const name = text("name").notNull();

/**
 * Audit timestamp columns for tracking record lifecycle
 * Stored as ISO 8601 strings for SQLite compatibility
 *
 * - createdAt: Auto-set on insert
 * - updatedAt: Auto-set on insert and update
 * - deletedAt: Nullable for soft delete
 *
 * Usage: ...auditTimestamps
 */
export const auditTimestamps = {
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdateFn(() => new Date().toISOString()),
  deletedAt: text("deleted_at"), // nullable for soft delete
};
