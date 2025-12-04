import { sqliteTable } from "drizzle-orm/sqlite-core";
import { auditColumns, idColumn, nameColumn } from "./columns";

/**
 * Proposals table schema
 *
 * Stores proposal records with soft delete support
 */
export const proposals = sqliteTable("proposals", {
  id: idColumn,
  name: nameColumn,
  ...auditColumns,
});

// Type inference for select and insert operations
export type ProposalRecord = typeof proposals.$inferSelect;
export type NewProposalRecord = typeof proposals.$inferInsert;
