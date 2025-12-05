import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id, name } from "./columns";
import { companyRelationships } from "./companyRelationships";

/**
 * Projects table schema
 *
 * A customer project that will be proposed against.
 * One project can have multiple proposal versions.
 */
export const projects = sqliteTable("projects", {
  id,
  customerId: text("customer_id")
    .notNull()
    .references(() => companyRelationships.id), // Constrained to customers via app logic
  name,
  projectedStartDate: text("projected_start_date"), // ISO 8601 timestamp, nullable
  ...auditTimestamps,
});

export type ProjectRecord = typeof projects.$inferSelect;
export type NewProjectRecord = typeof projects.$inferInsert;
