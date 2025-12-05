import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id } from "./columns";
import { companies } from "./companies";
import { companyRelationshipTypes } from "./enums";

/**
 * Company relationships table schema
 *
 * Defines the type of business relationship with a company.
 * A single company can have multiple relationships (e.g., both customer AND vendor).
 * The user's company is identified by relationship = 'SELF'.
 */
export const companyRelationships = sqliteTable("company_relationships", {
  id,
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  relationship: text("relationship", {
    enum: companyRelationshipTypes,
  }).notNull(),
  startDate: text("start_date").notNull(), // ISO 8601 timestamp
  ...auditTimestamps,
});

export type CompanyRelationshipRecord =
  typeof companyRelationships.$inferSelect;
export type NewCompanyRelationshipRecord =
  typeof companyRelationships.$inferInsert;
