import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id, name } from "./columns";
import { projects } from "./projects";

/**
 * Proposals table schema
 *
 * A specific proposal version for a project.
 * Multiple proposals can exist per project (revisions, alternatives).
 */
export const proposals = sqliteTable("proposals", {
  id,
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  name,
  finalOn: text("final_on"), // ISO 8601 timestamp - when marked as final
  submittedOn: text("submitted_on"), // ISO 8601 timestamp - when sent to customer
  acceptedOn: text("accepted_on"), // ISO 8601 timestamp - when customer accepted
  ...auditTimestamps,
});

// Type inference for select and insert operations
export type ProposalRecord = typeof proposals.$inferSelect;
export type NewProposalRecord = typeof proposals.$inferInsert;
