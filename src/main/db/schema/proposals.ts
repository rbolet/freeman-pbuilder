import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Proposals table schema
 *
 * Stores proposal records with soft delete support
 */
export const proposals = sqliteTable("proposals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),

  // Audit timestamps (stored as ISO 8601 strings)
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

// Type inference for select and insert operations
export type ProposalRecord = typeof proposals.$inferSelect;
export type NewProposalRecord = typeof proposals.$inferInsert;
